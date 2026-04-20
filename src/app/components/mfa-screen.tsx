import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Shield, CheckCircle2, AlertCircle, Smartphone, RefreshCw, Lock, ShieldCheck } from 'lucide-react';

export function MFAScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const correctOTP = '123456';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

    if (enteredOTP === correctOTP) {
      setSuccess(true);
      setError('');
      setTimeout(() => {
        setSuccess(false);
        setOtp(['', '', '', '', '', '']);
        setAttempts(0);
        inputRefs.current[0]?.focus();
      }, 3000);
    } else {
      setAttempts(attempts + 1);
      setError('Invalid verification code. Please check and try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    setAttempts(0);
    inputRefs.current[0]?.focus();
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
            <h2 className="text-xl font-semibold mb-2">Enter Verification Code</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              We've sent a 6-digit verification code to your registered device for added security
            </p>
          </div>

          {/* Device Info */}
          <div className="flex items-center justify-center gap-3 p-4 bg-accent rounded-xl mb-8 border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Code sent to</p>
              <p className="text-sm text-muted-foreground">••••••1234</p>
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
                      Too many failed attempts. Please request a new code.
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Verification successful! Access granted.
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

          {/* Resend Option */}
          <div className="text-center space-y-3 pb-6 border-b border-border">
            <p className="text-sm text-muted-foreground">Didn't receive the code?</p>
            <Button
              variant="ghost"
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="text-primary hover:text-primary/80 font-medium"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${resendTimer > 0 ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
            </Button>
          </div>

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
