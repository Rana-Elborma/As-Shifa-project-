import { useState } from 'react';
import { Heart, Mail, Lock, Shield, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../../supabase';
import type { User } from '../App';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onBackToLanding?: () => void;
  registrationSuccess?: boolean;
}

export function LoginScreen({ onLogin, onBackToLanding, registrationSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Holds the resolved user between the credentials step and the MFA step
  const [pendingUser, setPendingUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null);

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
      .select('name, role')
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
    setStep('mfa');
  };

  const handleMFASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (pendingUser) {
      onLogin({
        id: pendingUser.id,
        name: pendingUser.name,
        role: pendingUser.role as any,
        email: pendingUser.email,
      });
    }
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

          {step === 'credentials' ? (
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
          ) : (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground text-center">Enter the 6-digit code from your authenticator app</p>
              </div>

              <form onSubmit={handleMFASubmit} className="space-y-4">
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
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-700">For demo purposes, enter any 6-digit code (e.g., 123456)</p>
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
