import { useState } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Clock, CheckCircle2, Star, MapPin, Award, Video, X, Sparkles, Zap } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  initials: string;
  rating: number;
  reviews: number;
  experience: number;
  location: string;
  availableSlots: string[];
  telemedicine: boolean;
  recommended?: boolean;
}

const doctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Alabkari',
    specialty: 'Cardiologist',
    initials: 'SA',
    rating: 4.9,
    reviews: 245,
    experience: 15,
    location: 'Main Building, Floor 3',
    availableSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
    telemedicine: true,
    recommended: true,
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'General Practitioner',
    initials: 'MC',
    rating: 4.8,
    reviews: 189,
    experience: 12,
    location: 'Main Building, Floor 2',
    availableSlots: ['08:30 AM', '11:00 AM', '01:00 PM', '03:30 PM'],
    telemedicine: true,
  },
  {
    id: 3,
    name: 'Dr. Emily Davis',
    specialty: 'Pediatrician',
    initials: 'ED',
    rating: 5.0,
    reviews: 312,
    experience: 18,
    location: 'Children\'s Wing, Floor 1',
    availableSlots: ['09:30 AM', '11:30 AM', '02:30 PM', '05:00 PM'],
    telemedicine: false,
  },
];

export function AppointmentBooking() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'telemedicine'>('in-person');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBookAppointment = () => {
    if (selectedDoctor && selectedDate && selectedTime) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmBooking = () => {
    setShowConfirmation(false);
    setTimeout(() => {
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedTime('');
      setAppointmentType('in-person');
    }, 500);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* AI Suggestion Banner */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-purple-500/10 border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">AI Recommendation</h3>
            <p className="text-sm text-muted-foreground">Based on your medical history, we recommend Dr. Sarah Alabkari for your cardiac consultation.</p>
          </div>
        </div>
      </div>

      {/* Doctors Carousel */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Available Specialists</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              onClick={() => setSelectedDoctor(doctor)}
              className={`flex-shrink-0 w-80 backdrop-blur-xl bg-white/70 border rounded-3xl p-6 cursor-pointer transition-all hover:scale-105 snap-start relative group ${
                selectedDoctor?.id === doctor.id
                  ? 'ring-2 ring-primary shadow-2xl shadow-primary/20 border-primary/40'
                  : 'border-white/40 hover:border-primary/30 shadow-xl'
              }`}
            >
              {/* Recommended Badge */}
              {doctor.recommended && (
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 animate-pulse">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              )}

              {/* Glow Effect */}
              {selectedDoctor?.id === doctor.id && (
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-purple-500 rounded-3xl blur-xl opacity-30 -z-10" />
              )}

              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16 bg-gradient-to-br from-primary via-blue-500 to-secondary ring-4 ring-white/50 shadow-lg">
                  <AvatarFallback className="text-white text-lg font-semibold">
                    {doctor.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{doctor.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{doctor.specialty}</p>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
                  </div>
                </div>

                {doctor.telemedicine && (
                  <div className="px-2 py-1 rounded-full bg-green-100 border border-green-200 flex items-center gap-1">
                    <Video className="w-3 h-3 text-green-700" />
                    <span className="text-xs font-medium text-green-700">Video</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Award className="w-4 h-4" />
                <span>{doctor.experience}+ years experience</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>

              {/* Time Slots Preview */}
              <div className="flex gap-2">
                {doctor.availableSlots.slice(0, 3).map((slot) => (
                  <div
                    key={slot}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 text-xs font-medium text-primary"
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {selectedDoctor?.id === doctor.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Panel */}
      {selectedDoctor && (
        <div className="backdrop-blur-2xl bg-white/70 border border-white/40 rounded-3xl shadow-2xl shadow-primary/10 p-8 relative">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-purple-500 rounded-3xl blur-2xl opacity-20 -z-10" />

          <h3 className="text-2xl font-bold text-foreground mb-6">Complete Your Booking</h3>

          {/* Appointment Type */}
          {selectedDoctor.telemedicine && (
            <div className="space-y-3 mb-6">
              <label className="text-sm font-semibold text-foreground">Appointment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAppointmentType('in-person')}
                  className={`p-4 rounded-2xl border-2 transition-all text-sm font-semibold ${
                    appointmentType === 'in-person'
                      ? 'bg-gradient-to-r from-primary to-indigo-500 border-primary text-white shadow-lg shadow-primary/30'
                      : 'border-white/40 backdrop-blur-xl bg-white/50 hover:border-primary/50 text-foreground'
                  }`}
                >
                  In-Person Visit
                </button>
                <button
                  onClick={() => setAppointmentType('telemedicine')}
                  className={`p-4 rounded-2xl border-2 transition-all text-sm font-semibold flex items-center justify-center gap-2 ${
                    appointmentType === 'telemedicine'
                      ? 'bg-gradient-to-r from-secondary to-purple-500 border-secondary text-white shadow-lg shadow-secondary/30'
                      : 'border-white/40 backdrop-blur-xl bg-white/50 hover:border-secondary/50 text-foreground'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Video Call
                </button>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Date Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Select Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                <input
                  type="date"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all focus:shadow-lg focus:shadow-primary/20"
                  min={getTodayDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">Available Time Slots</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDoctor.availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        selectedTime === slot
                          ? 'bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-primary/30'
                          : 'bg-white/50 backdrop-blur-xl border border-white/40 hover:border-primary/50 text-foreground'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime}
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Confirm Booking
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          />

          {/* Modal */}
          <div className="relative backdrop-blur-2xl bg-white/90 border border-white/40 rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-purple-500 rounded-3xl blur-2xl opacity-20 -z-10" />

            {/* Close Button */}
            <button
              onClick={() => setShowConfirmation(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/50 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary via-secondary to-purple-600 bg-clip-text text-transparent">
              Booking Confirmed!
            </h2>

            {/* Description */}
            <p className="text-center text-muted-foreground mb-6">
              Your appointment has been successfully scheduled.
            </p>

            {/* Details */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-6 rounded-2xl space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Doctor:</span>
                <span className="font-semibold text-foreground">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-semibold text-foreground">{selectedDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="font-semibold text-foreground">{selectedTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Type:</span>
                <span className="font-semibold text-foreground capitalize">{appointmentType}</span>
              </div>
            </div>

            {/* Email Notice */}
            <p className="text-sm text-center text-muted-foreground mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-4 rounded-2xl border-2 backdrop-blur-xl bg-white/50 hover:bg-white/80"
              >
                Close
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-600 text-white font-semibold shadow-lg shadow-primary/30"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
