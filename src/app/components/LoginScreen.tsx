import { useState, useEffect, useRef } from 'react';
import { Heart, Mail, Lock, Shield, CheckCircle2, AlertCircle, ArrowLeft, QrCode, Smartphone, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../../supabase';
import { generateSecret, getTOTPUri, verifyTOTP, encryptSecret, decryptSecret } from '../lib/totp';
import * as QRCode from 'qrcode';
import type { User } from '../App';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onBackToLanding?: () => void;
  registrationSuccess?: boolean;
}

type Step = 'credentials' | 'mfa-enroll' | 'mfa-verify';

export function LoginScreen({ onLogin, onBackToLanding, registrationSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Holds the resolved user between the credentials step and the MFA step
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

  // TOTP enrollment state
  const [totpSecret, setTotpSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code when enrolling
  useEffect(() => {
    if (step === 'mfa-enroll' && totpSecret && pendingUser) {
      const uri = getTOTPUri(totpSecret, pendingUser.email);
      QRCode.toDataURL(uri, {
        width: 240,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [step, totpSecret, pendingUser]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (authError || !data.user) {
      setError('Invalid email or password. Please check your credentials.');
      return;
    }

    // Check the users table — if no row exists the account was never fully registered
    const { data: userRecord } = await supabase
      .from('users')
      .select('name, role, totp_secret')
      .eq('id', data.user.id)
      .single();

    if (!userRecord) {
      // Auth exists but profile is missing → reject and sign out the session
      await supabase.auth.signOut();
      setError('No registered account found for this email. Please sign up first.');
      setLoading(false);
      return;
    }

    setPendingUser({
      id: data.user.id,
      email: data.user.email ?? email,
      name: userRecord.name,
      role: userRecord.role,
    });

    if (userRecord.totp_secret) {
      // User already enrolled — go straight to verification
      try {
        const decrypted = await decryptSecret(userRecord.totp_secret, password);
        setTotpSecret(decrypted);
      } catch {
        // If decryption fails (e.g. password changed), re-enroll
        const newSecret = generateSecret();
        setTotpSecret(newSecret);
        setStep('mfa-enroll');
        return;
      }
      setStep('mfa-verify');
    } else {
      // First time — need to enroll
      const newSecret = generateSecret();
      setTotpSecret(newSecret);
      setStep('mfa-enroll');
    }
  };

  const handleEnrollVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!verifyTOTP(totpSecret, otp)) {
      setError('Invalid code. Make sure you scanned the QR code and entered the current code from Google Authenticator.');
      setOtp('');
      return;
    }

    // Save the encrypted secret to Supabase
    setLoading(true);
    try {
      const encryptedSecret = await encryptSecret(totpSecret, password);
      const { error: updateError } = await supabase
        .from('users')
        .update({ totp_secret: encryptedSecret })
        .eq('id', pendingUser!.id);

      if (updateError) {
        setError('Failed to save 2FA settings. Please try again.');
        setLoading(false);
        return;
      }
    } catch {
      setError('Encryption error. Please try again.');
      setLoading(false);
      return;
    }

    setLoading(false);

    // Login the user
    if (pendingUser) {
      onLogin({
        id: pendingUser.id,
        name: pendingUser.name,
        role: pendingUser.role as any,
        email: pendingUser.email,
      });
    }
  };

  const handleMFAVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!verifyTOTP(totpSecret, otp)) {
      setError('Invalid verification code. Please check Google Authenticator and try again.');
      setOtp('');
      return;
    }

    // Code is valid — complete login
    if (pendingUser) {
      onLogin({
        id: pendingUser.id,
        name: pendingUser.name,
        role: pendingUser.role as any,
        email: pendingUser.email,
      });
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(totpSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-purple-500/5 -z-10" />

      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/70 border border-white/40 hover:bg-white/90 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-xl shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">As-Shifa Healthcare</h1>
              <p className="text-sm text-muted-foreground">Secure Management System</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-2xl bg-white/70 border border-white/40 rounded-3xl shadow-xl p-8">
          {/* Registration success banner */}
          {registrationSuccess && step === 'credentials' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 mb-6">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-700 font-medium">Account created successfully! Please sign in.</p>
            </div>
          )}

          {/* ─── STEP 1: Credentials ─── */}
          {step === 'credentials' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Sign in to access your account</p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? 'Signing in…' : 'Continue to MFA'}
                </Button>
              </form>
            </>
          )}

          {/* ─── STEP 2a: TOTP Enrollment (first time) ─── */}
          {step === 'mfa-enroll' && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Set Up 2FA</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code with Google Authenticator to link your account
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary">1. Scan QR</span>
                </div>
                <div className="w-6 h-px bg-border" />
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                  <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">2. Verify</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="TOTP QR Code" className="w-56 h-56" />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>

                {/* Manual entry option */}
                <div className="w-full">
                  <p className="text-xs text-muted-foreground text-center mb-2">Can't scan? Enter this key manually:</p>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <code className="flex-1 text-xs font-mono text-foreground tracking-wider break-all select-all">
                      {totpSecret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy secret key"
                    >
                      {secretCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* How-to instructions */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 mb-6">
                <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p className="font-semibold text-blue-900">How to set up:</p>
                  <ol className="list-decimal ml-3.5 space-y-0.5">
                    <li>Open <strong>Google Authenticator</strong> app</li>
                    <li>Tap the <strong>+</strong> button → <strong>Scan QR code</strong></li>
                    <li>Point your camera at the QR code above</li>
                    <li>Enter the 6-digit code shown in the app below</li>
                  </ol>
                </div>
              </div>

              {/* Verification code input */}
              <form onSubmit={handleEnrollVerify} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Enter code from the app</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    placeholder="000000"
                    className="w-full px-4 py-4 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(''); setError(''); setTotpSecret(''); setQrDataUrl(''); }}
                    variant="outline"
                    className="flex-1 py-6 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-2 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    {loading ? 'Saving…' : 'Verify & Activate'}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ─── STEP 2b: TOTP Verification (returning user) ─── */}
          {step === 'mfa-verify' && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground text-center">Enter the 6-digit code from Google Authenticator</p>
              </div>

              {/* Device indicator */}
              <div className="flex items-center justify-center gap-3 p-3.5 bg-accent rounded-xl mb-6 border border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Google Authenticator</p>
                  <p className="text-xs text-muted-foreground">Enter the code from your app</p>
                </div>
              </div>

              <form onSubmit={handleMFAVerify} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                    }}
                    placeholder="000000"
                    className="w-full px-4 py-4 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Security badge */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700">
                    Your account is protected with TOTP-based two-factor authentication. The code changes every 30 seconds.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                    variant="outline"
                    className="flex-1 py-6 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-2 py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg transition-all hover:scale-105"
                  >
                    Verify & Login
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 All communications are encrypted with 256-bit AES encryption
          </p>
        </div>
      </div>
    </div>
  );
}
