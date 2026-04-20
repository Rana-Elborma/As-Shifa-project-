import { useState, useRef } from 'react';
import { Calendar, FileText, Pill, Video, User, Clock, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { TelemedicineCall } from './telemedicine-call';
import type { Patient, Appointment } from '../App';

interface PatientDashboardProps {
  patient: Patient;
  onUpdatePatient: (patientId: string, updates: Partial<Patient>) => void;
  onBookAppointment: (appointment: Appointment) => void;
  addAuditLog: (action: string, details: string) => void;
}

export function PatientDashboard({ patient, onBookAppointment, addAuditLog }: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'history' | 'prescriptions' | 'telemedicine'>('overview');
  const historyViewedRef = useRef(false);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: User },
    { id: 'appointments' as const, label: 'Appointments', icon: Calendar },
    { id: 'telemedicine' as const, label: 'Telemedicine', icon: Video },
    { id: 'history' as const, label: 'Medical History', icon: FileText },
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: Pill }
  ];

  const handleTabChange = (tabId: 'overview' | 'appointments' | 'history' | 'prescriptions' | 'telemedicine') => {
    setActiveTab(tabId);

    // Log audit only once when medical history is first viewed
    if (tabId === 'history' && !historyViewedRef.current) {
      historyViewedRef.current = true;
      addAuditLog('VIEW_MEDICAL_HISTORY', `Patient ${patient.name} viewed their medical history`);
    }

    // Log telemedicine access
    if (tabId === 'telemedicine') {
      addAuditLog('ACCESS_TELEMEDICINE', `Patient ${patient.name} accessed telemedicine interface`);
    }
  };

  const handleViewPrescription = (prescriptionId: string) => {
    addAuditLog('VIEW_PRESCRIPTION', `Patient ${patient.name} viewed prescription ${prescriptionId}`);
  };

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
              <p className="text-lg font-mono text-primary">{patient.id}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{patient.appointments.length}</p>
          <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
          <FileText className="w-8 h-8 text-secondary mb-3" />
          <p className="text-2xl font-bold text-foreground">{patient.medicalHistory.length}</p>
          <p className="text-sm text-muted-foreground">Medical Records</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer">
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
      <div className={activeTab === 'telemedicine' ? '' : 'backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8'}>
        {activeTab === 'telemedicine' && (
          <TelemedicineCall />
        )}

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
                    <p className="font-semibold text-foreground">{patient.dateOfBirth}</p>
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
                    <p className="font-semibold text-foreground">{patient.phone}</p>
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

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">My Appointments</h3>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Book New Appointment
              </Button>
            </div>

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
                    <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white">
                      <Video className="w-4 h-4 mr-2" />
                      Join Telemedicine Call
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Medical History</h3>

            <div className="space-y-4">
              {patient.medicalHistory.map((record) => (
                  <div key={record.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">{record.diagnosis}</h4>
                        <p className="text-sm text-muted-foreground">{record.doctorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{record.date}</p>
                      </div>
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
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Active Prescriptions</h3>

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
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{rx.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Dosage</p>
                      <p className="text-muted-foreground">{rx.dosage}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Frequency</p>
                      <p className="text-muted-foreground">{rx.frequency}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Duration</p>
                      <p className="text-muted-foreground">{rx.duration}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/40">
                    <p className="text-xs text-muted-foreground">🔒 This prescription is digitally signed and encrypted</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
