import { useState } from 'react';
import { Calendar, FileText, Users, Pill, Video, Plus, Search, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { TelemedicineCall } from './telemedicine-call';
import { supabase } from '../../supabase';
import type { Patient, Appointment } from '../App';

interface DoctorDashboardProps {
  patients: Patient[];
  appointments: Appointment[];
  onUpdatePatient: (patientId: string, updates: Partial<Patient>) => void;
  addAuditLog: (action: string, details: string) => void;
  currentUserName: string;
}

export function DoctorDashboard({ patients, appointments, onUpdatePatient, addAuditLog, currentUserName }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'prescribe'>('appointments');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Telemedicine call state
  const [showTelemedicine, setShowTelemedicine] = useState(false);
  const [teleAppointment, setTeleAppointment] = useState<Appointment | null>(null);

  // Add medical record form state
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatment, setNewTreatment] = useState('');

  // Prescribe form state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [prescribeNotes, setPrescribeNotes] = useState('');
  const [prescribeSuccess, setPrescribeSuccess] = useState('');

  const tabs = [
    { id: 'appointments' as const, label: 'Appointments', icon: Calendar },
    { id: 'patients' as const, label: 'Patients', icon: Users },
    { id: 'prescribe' as const, label: 'Prescribe', icon: Pill }
  ];

  // Only show scheduled appointments for this doctor
  const doctorAppointments = appointments.filter(
    apt => apt.status === 'scheduled' && apt.doctorName === currentUserName
  );

  // Patients who have ever booked with this doctor (any status)
  const myPatientIds = new Set(
    appointments
      .filter(apt => apt.doctorName === currentUserName)
      .map(apt => apt.patientId)
  );
  const myPatients = patients.filter(p => myPatientIds.has(p.id));

  const handleViewPatientRecord = (patient: Patient) => {
    setSelectedPatient(patient);
    addAuditLog('VIEW_MEDICAL_HISTORY', `${currentUserName} accessed medical record for patient ${patient.name}`);
  };

  const handleStartCall = (apt: Appointment) => {
    setTeleAppointment(apt);
    setShowTelemedicine(true);
    addAuditLog('START_TELEMEDICINE', `${currentUserName} started telemedicine call with ${apt.patientName}`);
  };

  const handleEndCall = () => {
    if (teleAppointment) {
      addAuditLog('END_TELEMEDICINE', `${currentUserName} ended telemedicine call with ${teleAppointment.patientName}`);
    }
    setShowTelemedicine(false);
    setTeleAppointment(null);
  };

  const handleUpdateMedicalHistory = async (patientId: string, diagnosis: string, treatment: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const newRecord = {
      id: `MR${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      treatment,
      doctorName: currentUserName,
      notes: 'Updated during consultation',
    };

    await supabase.from('medical_history').insert([{
      id: newRecord.id,
      patient_id: patientId,
      date: newRecord.date,
      diagnosis,
      treatment,
      notes: newRecord.notes,
      doctor_name: currentUserName,
    }]);

    onUpdatePatient(patientId, {
      medicalHistory: [...patient.medicalHistory, newRecord],
    });

    addAuditLog('UPDATE_MEDICAL_HISTORY', `${currentUserName} updated medical history for patient ${patient.name}`);

    // Update open modal immediately so new record appears without closing
    setSelectedPatient(prev => prev ? { ...prev, medicalHistory: [...prev.medicalHistory, newRecord] } : null);
  };

  const handleIssuePrescription = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient || !medication.trim()) return;

    const newPrescription = {
      id: `RX${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      medication,
      dosage,
      instructions: `${frequency} for ${duration}. ${prescribeNotes}`.trim(),
      doctorName: currentUserName,
      status: 'active' as const,
    };

    await supabase.from('prescriptions').insert([{
      id: newPrescription.id,
      patient_id: selectedPatientId,
      date: newPrescription.date,
      medication,
      dosage,
      instructions: newPrescription.instructions,
      doctor_name: currentUserName,
      status: 'active',
    }]);

    onUpdatePatient(selectedPatientId, {
      prescriptions: [...patient.prescriptions, newPrescription],
    });

    addAuditLog('ISSUE_PRESCRIPTION', `${currentUserName} prescribed ${medication} to ${patient.name}`);

    // Show success banner then hide after 3 seconds
    setPrescribeSuccess(`Prescription for ${medication} issued to ${patient.name} successfully.`);
    setTimeout(() => setPrescribeSuccess(''), 3000);

    // Reset all fields
    setSelectedPatientId('');
    setMedication('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setPrescribeNotes('');
  };

  const handleAddRecord = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newDiagnosis.trim() || !newTreatment.trim()) return;

    handleUpdateMedicalHistory(selectedPatient.id, newDiagnosis, newTreatment);

    setNewDiagnosis('');
    setNewTreatment('');
    setShowAddRecord(false);
  };

  const filteredPatients = myPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show telemedicine screen instead of dashboard when a call is active
  if (showTelemedicine && teleAppointment) {
    return (
      <TelemedicineCall
        doctorName={currentUserName}
        patientName={teleAppointment.patientName}
        appointmentDate={teleAppointment.date}
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
            <h2 className="text-3xl font-bold text-primary mb-2">Good morning, {currentUserName}</h2>
            <p className="text-muted-foreground">You have {doctorAppointments.length} appointments scheduled</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">Cardiology Department</p>
              <p className="text-xs text-muted-foreground">Main Building, Floor 3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Calendar className="w-8 h-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{doctorAppointments.length}</p>
          <p className="text-sm text-muted-foreground">Scheduled Appointments</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Users className="w-8 h-8 text-secondary mb-3" />
          <p className="text-2xl font-bold text-foreground">{myPatients.length}</p>
          <p className="text-sm text-muted-foreground">My Patients</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Video className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-2xl font-bold text-foreground">
            {doctorAppointments.filter(a => a.type === 'telemedicine').length}
          </p>
          <p className="text-sm text-muted-foreground">Telemedicine</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <FileText className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-foreground">
            {myPatients.reduce((sum, p) => sum + p.medicalHistory.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Medical Records</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        {/* ── APPOINTMENTS TAB ── */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Today's Schedule</h3>

            {doctorAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorAppointments.map(apt => (
                  <div key={apt.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {apt.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-foreground mb-1">{apt.patientName}</h4>
                          <p className="text-sm text-muted-foreground">{apt.type === 'telemedicine' ? '📹 Telemedicine' : '🏥 In-Person'}</p>
                          <p className="text-sm text-foreground mt-1">Patient ID: {apt.patientId}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">{apt.time}</p>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mt-2">
                          {apt.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          const patient = patients.find(p => p.id === apt.patientId);
                          if (patient) handleViewPatientRecord(patient);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Records
                      </Button>
                      {apt.type === 'telemedicine' && (
                        <Button
                          onClick={() => handleStartCall(apt)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Start Call
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATIENTS TAB ── */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">Patient Records</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients..."
                  className="pl-12 pr-4 py-2 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No patients found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map(patient => (
                  <div key={patient.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-foreground mb-1">{patient.name}</h4>
                          <p className="text-sm text-muted-foreground">DOB: {patient.dateOfBirth}</p>
                          <p className="text-sm text-foreground mt-1">Patient ID: {patient.id}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewPatientRecord(patient)}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Full Record
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t border-white/40">
                      <div>
                        <p className="font-medium text-foreground">Medical Records</p>
                        <p className="text-muted-foreground">{patient.medicalHistory.length} records</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Prescriptions</p>
                        <p className="text-muted-foreground">{patient.prescriptions.length} active</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Appointments</p>
                        <p className="text-muted-foreground">{patient.appointments.length} scheduled</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PRESCRIBE TAB ── */}
        {activeTab === 'prescribe' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Issue New Prescription</h3>

            {/* Success banner */}
            {prescribeSuccess && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700">{prescribeSuccess}</p>
              </div>
            )}

            <div className="p-6 rounded-2xl bg-white/70 border border-white/40">
              <form onSubmit={handleIssuePrescription} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Patient</label>
                    <select
                      value={selectedPatientId}
                      onChange={e => setSelectedPatientId(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select patient...</option>
                      {myPatients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Medication</label>
                    <input
                      type="text"
                      value={medication}
                      onChange={e => setMedication(e.target.value)}
                      placeholder="e.g., Lisinopril"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={e => setDosage(e.target.value)}
                      placeholder="e.g., 10mg"
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                      placeholder="e.g., Once daily"
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      placeholder="e.g., 30 days"
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Notes</label>
                  <textarea
                    value={prescribeNotes}
                    onChange={e => setPrescribeNotes(e.target.value)}
                    rows={4}
                    placeholder="Additional instructions..."
                    className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg"
                >
                  <Pill className="w-5 h-5 mr-2" />
                  Issue Prescription
                </Button>
              </form>

              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  🔒 All prescriptions are digitally signed and encrypted. This action will be logged in the audit trail.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PATIENT RECORD MODAL ── rendered outside tabs so it works from any tab */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative backdrop-blur-2xl bg-white/90 border border-white/40 rounded-3xl shadow-2xl p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedPatient(null);
                setShowAddRecord(false);
                setNewDiagnosis('');
                setNewTreatment('');
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-all"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-foreground mb-6">Medical History — {selectedPatient.name}</h3>

            {/* Existing records */}
            <div className="space-y-4">
              {selectedPatient.medicalHistory.length === 0 && (
                <p className="text-sm text-muted-foreground">No medical records yet.</p>
              )}
              {selectedPatient.medicalHistory.map(record => (
                <div key={record.id} className="p-6 rounded-2xl bg-white/70 border border-white/40">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-lg text-foreground">{record.diagnosis}</h4>
                    <p className="text-sm font-semibold text-foreground">{record.date}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Treatment:</p>
                      <p className="text-muted-foreground">{record.treatment}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Notes:</p>
                      <p className="text-muted-foreground">{record.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Medical Record — collapsible form */}
            <div className="mt-6 pt-6 border-t border-white/40">
              <button
                onClick={() => setShowAddRecord(!showAddRecord)}
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-all mb-4"
              >
                <Plus className="w-4 h-4" />
                {showAddRecord ? 'Cancel' : 'Add Medical Record'}
              </button>

              {showAddRecord && (
                <form onSubmit={handleAddRecord} className="space-y-4 p-4 rounded-2xl bg-white/60 border border-white/40">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Diagnosis</label>
                    <input
                      type="text"
                      value={newDiagnosis}
                      onChange={e => setNewDiagnosis(e.target.value)}
                      placeholder="e.g., Hypertension"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Treatment</label>
                    <input
                      type="text"
                      value={newTreatment}
                      onChange={e => setNewTreatment(e.target.value)}
                      placeholder="e.g., Prescribed medication and lifestyle changes"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-white/40 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
                    Save Record
                  </Button>
                </form>
              )}
            </div>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">🔒 All access to this medical record is logged and encrypted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
