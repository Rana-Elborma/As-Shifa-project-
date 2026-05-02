import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  Lock,
  Shield,
  MessageSquare,
  Settings,
  Monitor,
  Clock,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  ArrowLeft,
} from 'lucide-react';

interface TelemedicineCallProps {
  doctorName?: string;
  patientName?: string;
  appointmentDate?: string;
  onClose?: () => void;
}

export function TelemedicineCall({
  doctorName = 'Dr. Sarah Alabkari',
  patientName = 'Ahmed Ali',
  appointmentDate,
  onClose,
}: TelemedicineCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration] = useState('00:00');
  const [isCallActive, setIsCallActive] = useState(true);

  const doctorInitials = doctorName
    .split(' ')
    .filter(w => w !== 'Dr.')
    .map(w => w[0])
    .join('');

  const patientInitials = patientName
    .split(' ')
    .map(w => w[0])
    .join('');

  const displayDate = appointmentDate
    ? new Date(appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Today';

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  if (!isCallActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-border shadow-2xl">
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Call Ended</h3>
                <p className="text-muted-foreground">
                  Your secure telemedicine session with {patientName} has ended successfully
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Duration: {callDuration}</span>
              </div>
              <div className="pt-4 flex gap-3 justify-center">
                <Button onClick={() => setIsCallActive(true)} size="lg" className="px-8">
                  Start New Call
                </Button>
                {onClose && (
                  <Button onClick={onClose} variant="outline" size="lg" className="px-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/70 border border-white/40 hover:bg-white/90 transition-all shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
          )}
          <div>
            <h1 className="text-3xl font-semibold mb-1">Secure Telemedicine</h1>
            <p className="text-muted-foreground">End-to-end encrypted video consultation</p>
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <Card className="border-secondary bg-gradient-to-r from-secondary/10 via-green-50 to-secondary/10 shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-secondary" />
                <span className="font-semibold text-secondary">End-to-End Encrypted Connection</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{callDuration}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Doctor Video (Main) */}
          <Card className="border-border shadow-2xl overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 via-blue-500/20 to-secondary/20 flex items-center justify-center">
              {isVideoOff ? (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto">
                    <VideoOff className="w-12 h-12 text-white/60" />
                  </div>
                  <p className="text-white text-lg font-medium">Camera is off</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Avatar className="w-40 h-40 mx-auto bg-gradient-to-br from-primary via-blue-500 to-secondary ring-8 ring-white shadow-2xl">
                    <AvatarFallback className="text-white text-4xl font-semibold">
                      {doctorInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white">
                    <h3 className="text-2xl font-semibold">{doctorName}</h3>
                    <p className="text-lg opacity-90">Cardiologist</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg">
                <p className="text-white font-semibold">{doctorName}</p>
                <p className="text-white/90 text-sm">Cardiologist</p>
              </div>

              <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 font-medium shadow-lg">
                <Lock className="w-4 h-4" />
                Encrypted
              </div>
            </div>
          </Card>

          {/* Patient Video (Picture-in-Picture) */}
          <Card className="border-border shadow-xl overflow-hidden">
            <div className="relative h-56 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <div className="text-center space-y-3">
                <Avatar className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 ring-4 ring-white shadow-xl">
                  <AvatarFallback className="text-white text-2xl font-semibold">
                    {patientInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold text-lg">{patientName}</p>
                  <p className="text-white/80 text-sm">Patient</p>
                </div>
              </div>

              {isMuted && (
                <div className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full shadow-lg">
                  <MicOff className="w-5 h-5" />
                </div>
              )}
            </div>
          </Card>

          {/* Call Controls */}
          <Card className="border-border shadow-xl">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-14 h-14 rounded-full p-0 ${isMuted ? 'bg-red-100 border-red-300 hover:bg-red-200' : ''}`}
                >
                  {isMuted ? <MicOff className="w-6 h-6 text-red-600" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-14 h-14 rounded-full p-0 ${isVideoOff ? 'bg-red-100 border-red-300 hover:bg-red-200' : ''}`}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6 text-red-600" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button variant="outline" size="lg" className="w-14 h-14 rounded-full p-0">
                  <Monitor className="w-6 h-6" />
                </Button>

                <Button variant="outline" size="lg" className="w-14 h-14 rounded-full p-0">
                  <MessageSquare className="w-6 h-6" />
                </Button>

                <Button variant="outline" size="lg" className="w-14 h-14 rounded-full p-0">
                  <Settings className="w-6 h-6" />
                </Button>

                <Separator orientation="vertical" className="h-12 mx-2" />

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleEndCall}
                  className="w-14 h-14 rounded-full p-0 bg-red-600 hover:bg-red-700 shadow-lg"
                >
                  <Phone className="w-6 h-6 rotate-135" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Your connection is secure and end-to-end encrypted
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Session Info */}
          <Card className="border-border shadow-xl">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Session Status
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Connection:</span>
                    <Badge className="bg-green-100 text-green-700 border-green-200">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{callDuration}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-accent transition-colors">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className="font-semibold text-green-600">HD 1080p</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  Security Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                    <Shield className="w-5 h-5 text-secondary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">AES-256 Encryption</p>
                      <p className="text-muted-foreground text-xs">Military-grade end-to-end encryption</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1 text-green-900">HIPAA Compliant</p>
                      <p className="text-green-700 text-xs">Protected health information</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card className="border-border shadow-xl">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Appointment Details
              </h4>
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Patient</p>
                  <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{patientName}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Doctor</p>
                  <div className="p-2 bg-accent rounded-lg">
                    <p className="font-medium">{doctorName}</p>
                    <p className="text-xs text-muted-foreground">Cardiologist</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Date</p>
                  <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{displayDate}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 w-full justify-center py-2">
                    <Video className="w-3 h-3 mr-1.5" />
                    Telemedicine
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-secondary mb-2">Secure Session</p>
                  <p className="text-muted-foreground leading-relaxed">
                    This call is end-to-end encrypted. Your privacy and medical data are protected according to HIPAA standards. No recording is being made.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
