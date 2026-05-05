import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Shield, CheckCircle2, AlertCircle, Smartphone, Lock, ShieldCheck, QrCode } from 'lucide-react';
import { generateSecret, getTOTPUri, verifyTOTP } from '../lib/totp';
import * as QRCode from 'qrcode';

export function MFAScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // TOTP state
  const [totpSecret] = useState(() => generateSecret());
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const uri = getTOTPUri(totpSecret, 'demo@as-shifa.com');
    QRCode.toDataURL(uri, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    }).then(setQrDataUrl).catch(console.error);
  }, [totpSecret]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredOTP = otp.join('');

    if (enteredOTP.length < 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    // Use real TOTP verification
    if (verifyTOTP(totpSecret, enteredOTP)) {
      setSuccess(true);
      setError('');
      setIsEnrolled(true);
      setTimeout(() => {
        setSuccess(false);
        setOtp(['', '', '', '', '', '']);
        setAttempts(0);
        inputRefs.current[0]?.focus();
      }, 3000);
    } else {
      setAttempts(attempts + 1);
      setError('Invalid verification code. Please enter the code shown in Google Authenticator.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">
          Verify your identity to access secure healthcare information
        </p>
      </div>

      <Card className="border-border shadow-2xl">
        <CardContent className="p-10">
          {/* Icon and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary via-green-500 to-primary rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-background">
                <Lock className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {isEnrolled ? 'Enter Verification Code' : 'Set Up Google Authenticator'}
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              {isEnrolled
                ? 'Enter the 6-digit code from Google Authenticator'
                : 'Scan the QR code below with Google Authenticator, then enter the code to verify'}
            </p>
          </div>

          {/* QR Code Section (shown when not yet enrolled) */}
          {!isEnrolled && (
            <div className="flex flex-col items-center mb-8">
              <div className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="TOTP QR Code for Google Authenticator" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200 w-full">
                <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-semibold text-blue-900 mb-1">How to scan:</p>
                  <p>Open <strong>Google Authenticator</strong> → Tap <strong>+</strong> → <strong>Scan QR code</strong> → Point camera at the code above</p>
                </div>
              </div>
            </div>
          )}

          {/* Device Info */}
          <div className="flex items-center justify-center gap-3 p-4 bg-accent rounded-xl mb-8 border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Google Authenticator</p>
              <p className="text-sm text-muted-foreground">Enter the 6-digit code from the app</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-6 mb-8">
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-14 h-16 text-center text-2xl font-semibold rounded-xl transition-all ${
                    error
                      ? 'border-destructive bg-red-50'
                      : digit
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-accent/30'
                  }`}
                />
              ))}
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                  {attempts >= 2 && (
                    <span className="block mt-1 text-sm">
                      Too many failed attempts. Please check that Google Authenticator is showing the correct code.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Verification successful! {!isEnrolled ? '2FA has been activated.' : 'Access granted.'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full h-14 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all mb-6"
            disabled={success}
          >
            {success ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Verified Successfully
              </>
            ) : (
              'Verify Code'
            )}
          </Button>

          {/* Security Info */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900 mb-1">Your Account is Protected</p>
                <p className="text-blue-700 leading-relaxed">
                  Two-factor authentication adds an extra layer of security to your healthcare account. Never share your verification code with anyone, including our staff.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                <Lock className="w-3 h-3 mr-1" />
                Secure Connection
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                HIPAA Compliant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
