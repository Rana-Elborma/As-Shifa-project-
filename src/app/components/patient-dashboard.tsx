import { useState, useRef, useEffect } from 'react';
import { Calendar, FileText, Pill, Video, User, Clock, Phone, Mail, X, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { TelemedicineCall } from './telemedicine-call';
import { supabase } from '../../supabase';
import type { Patient, Appointment } from '../App';

interface PatientDashboardProps {
  patient: Patient;
  onUpdatePatient: (patientId: string, updates: Partial<Patient>) => void;
  onBookAppointment: (appointment: Appointment) => void;
  addAuditLog: (action: string, details: string) => void;
}

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM',
];

export function PatientDashboard({ patient, onUpdatePatient, onBookAppointment, addAuditLog }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'history' | 'prescriptions' | 'telemedicine'>('overview');
  const historyViewedRef = useRef(false);

  // Available doctors fetched from DB
  const [availableDoctors, setAvailableDoctors] = useState<string[]>([]);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookDoctor, setBookDoctor] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookType, setBookType] = useState<'in-person' | 'telemedicine'>('in-person');

  // Active telemedicine call
  const [callDoctor, setCallDoctor] = useState<string | null>(null);
  // Doctor selection on the telemedicine tab
  const [selectedCallDoctor, setSelectedCallDoctor] = useState('');

  useEffect(() => {
    supabase
      .from('users')
      .select('name')
      .eq('role', 'doctor')
      .then(({ data }) => {
        if (data) setAvailableDoctors(data.map(d => d.name));
      });
  }, []);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'appointments' as const, label: 'Appointments', icon: Calendar },
    { id: 'telemedicine' as const, label: 'Telemedicine', icon: Video },
    { id: 'history' as const, label: 'Medical History', icon: FileText },
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: Pill },
  ];

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (tabId === 'history' && !historyViewedRef.current) {
      historyViewedRef.current = true;
      addAuditLog('VIEW_MEDICAL_HISTORY', `Patient ${patient.name} viewed their medical history`);
    }
  };

  const handleStartCall = (doctorName: string) => {
    setCallDoctor(doctorName);
    addAuditLog('START_TELEMEDICINE', `Patient ${patient.name} started telemedicine call with ${doctorName}`);
  };

  const handleEndCall = () => {
    if (callDoctor) {
      addAuditLog('END_TELEMEDICINE', `Patient ${patient.name} ended telemedicine call with ${callDoctor}`);
    }
    setCallDoctor(null);
    setSelectedCallDoctor('');
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDoctor || !bookDate || !bookTime) return;

    const newAppointment: Appointment = {
      id: `APT-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: 'D001',
      doctorName: bookDoctor,
      date: bookDate,
      time: bookTime,
      type: bookType,
      status: 'scheduled',
    };

    onBookAppointment(newAppointment);
    addAuditLog('BOOK_APPOINTMENT', `Patient ${patient.name} booked ${bookType} appointment with ${bookDoctor}`);

    setShowBookingModal(false);
    setBookDoctor('');
    setBookDate('');
    setBookTime('');
    setBookType('in-person');
  };

  const handleViewPrescription = (prescriptionId: string) => {
    addAuditLog('VIEW_PRESCRIPTION', `Patient ${patient.name} viewed prescription ${prescriptionId}`);
  };

  // Full-screen telemedicine call — replaces the whole dashboard
  if (callDoctor) {
    return (
      <TelemedicineCall
        doctorName={callDoctor}
        patientName={patient.name}
        onClose={handleEndCall}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">Welcome back, {patient.name.split(' ')[0]}!</h2>
            <p className="text-muted-foreground">Manage your healthcare journey securely</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Patient ID</p>
              <p className="text-sm font-mono text-primary truncate max-w-[200px]">{patient.id}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{patient.appointments.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <FileText className="w-8 h-8 text-secondary mb-3" />
          <p className="text-2xl font-bold text-foreground">{patient.medicalHistory.length}</p>
          <p className="text-sm text-muted-foreground">Medical Records</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Pill className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-foreground">{patient.prescriptions.length}</p>
          <p className="text-sm text-muted-foreground">Active Prescriptions</p>
        </div>
        <button
          onClick={() => handleTabChange('telemedicine')}
          className="backdrop-blur-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 group cursor-pointer text-left relative overflow-hidden"
        >
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">TRY NOW</span>
          </div>
          <Video className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold text-purple-900">Available</p>
          <p className="text-sm text-purple-700 font-medium">Telemedicine</p>
          <p className="text-xs text-purple-600 mt-1">Click to start video call →</p>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Patient Profile</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-foreground">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold text-foreground">{patient.dateOfBirth || '—'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{patient.phone || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">🔒 Data Privacy Notice</h4>
              <p className="text-sm text-muted-foreground">
                Your medical information is encrypted with 256-bit AES encryption and stored securely.
                All access to your records is logged and monitored for security purposes.
              </p>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">My Appointments</h3>
              <Button
                onClick={() => setShowBookingModal(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

            {patient.appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No appointments yet.</p>
                <Button onClick={() => setShowBookingModal(true)} className="bg-primary hover:bg-primary/90 text-white">
                  Book Your First Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.appointments.map(apt => (
                  <div key={apt.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">{apt.doctorName}</h4>
                        <p className="text-sm text-muted-foreground">{apt.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-Person'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'scheduled' ? 'bg-green-50 text-green-700' :
                        apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {apt.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{apt.time}</span>
                      </div>
                    </div>
                    {apt.type === 'telemedicine' && apt.status === 'scheduled' && (
                      <Button
                        onClick={() => handleStartCall(apt.doctorName)}
                        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Telemedicine Call
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TELEMEDICINE TAB ── */}
        {activeTab === 'telemedicine' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">Secure Telemedicine</h3>
              <p className="text-muted-foreground">Start an end-to-end encrypted video consultation with your doctor</p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-600" />
                Start a New Call
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Choose Doctor</label>
                  {availableDoctors.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No doctors registered yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {availableDoctors.map(doc => (
                        <button
                          key={doc}
                          onClick={() => setSelectedCallDoctor(doc)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                            selectedCallDoctor === doc
                              ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                              : 'bg-white/70 border-white/40 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                              selectedCallDoctor === doc ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {doc.replace('Dr.', '').trim().split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{doc}</span>
                          </div>
                          {selectedCallDoctor === doc && <ChevronRight className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  disabled={!selectedCallDoctor}
                  onClick={() => handleStartCall(selectedCallDoctor)}
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-5 h-5 mr-2" />
                  {selectedCallDoctor ? `Call ${selectedCallDoctor}` : 'Select a Doctor to Start Call'}
                </Button>
              </div>
            </div>

            {/* Upcoming telemedicine appointments */}
            {patient.appointments.filter(a => a.type === 'telemedicine' && a.status === 'scheduled').length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-3">Scheduled Telemedicine Appointments</h4>
                <div className="space-y-3">
                  {patient.appointments
                    .filter(a => a.type === 'telemedicine' && a.status === 'scheduled')
                    .map(apt => (
                      <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl bg-white/70 border border-white/40">
                        <div>
                          <p className="font-medium text-foreground">{apt.doctorName}</p>
                          <p className="text-sm text-muted-foreground">{apt.date} at {apt.time}</p>
                        </div>
                        <Button
                          onClick={() => handleStartCall(apt.doctorName)}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              🔒 All telemedicine sessions are end-to-end encrypted and HIPAA compliant. No recordings are stored.
            </div>
          </div>
        )}

        {/* ── MEDICAL HISTORY TAB ── */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Medical History</h3>
            {patient.medicalHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No medical records yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.medicalHistory.map(record => (
                  <div key={record.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">{record.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">{record.doctorName}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{record.date}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-foreground">Treatment:</p>
                        <p className="text-muted-foreground">{record.treatment}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <p className="font-medium text-foreground">Notes:</p>
                          <p className="text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRESCRIPTIONS TAB ── */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Active Prescriptions</h3>
            {patient.prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No prescriptions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.prescriptions.map(rx => (
                  <div
                    key={rx.id}
                    className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => handleViewPrescription(rx.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">{rx.medication}</h4>
                        <p className="text-sm text-muted-foreground">Prescribed by {rx.doctorName}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{rx.date}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">Dosage</p>
                        <p className="text-muted-foreground">{rx.dosage}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Instructions</p>
                        <p className="text-muted-foreground">{rx.instructions}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/40">
                      <p className="text-xs text-muted-foreground">🔒 This prescription is digitally signed and encrypted</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOOKING MODAL ── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative backdrop-blur-2xl bg-white/90 border border-white/40 rounded-3xl shadow-2xl p-8 max-w-lg w-full">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-2xl font-bold text-foreground mb-6">Book New Appointment</h3>

            <form onSubmit={handleBookSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Doctor</label>
                <select
                  value={bookDoctor}
                  onChange={e => setBookDoctor(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select a doctor...</option>
                  {availableDoctors.map(doc => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                  <input
                    type="date"
                    value={bookDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setBookDate(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                  <select
                    value={bookTime}
                    onChange={e => setBookTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select time...</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Appointment Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['in-person', 'telemedicine'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookType(type)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                        bookType === type
                          ? 'bg-primary text-white border-primary shadow-lg'
                          : 'bg-white/50 border-white/40 text-muted-foreground hover:bg-white/80'
                      }`}
                    >
                      {type === 'telemedicine' ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      {type === 'in-person' ? 'In-Person' : 'Telemedicine'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-5 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
                >
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
