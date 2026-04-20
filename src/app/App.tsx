import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { PatientRegistration } from './components/patient-registration';
import { PatientDashboard } from './components/patient-dashboard';
import { DoctorDashboard } from './components/doctor-dashboard';
import { AdminDashboard } from './components/admin-dashboard';
import { Heart } from 'lucide-react';

// As-Shifa Secure Healthcare Management System
export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'admin' | null;
export type ViewMode = 'landing' | 'login' | 'signup';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  medicalHistory: MedicalRecord[];
  appointments: Appointment[];
  prescriptions: Prescription[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctorName: string;
  notes: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: 'in-person' | 'telemedicine';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  doctorName: string;
  date: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: '1',
      timestamp: new Date(2026, 3, 6, 10, 30),
      userId: 'U001',
      userName: 'Dr. Sarah Alabkari',
      action: 'VIEW_MEDICAL_HISTORY',
      details: 'Accessed patient record P12345',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: new Date(2026, 3, 6, 9, 15),
      userId: 'U002',
      userName: 'Admin User',
      action: 'LOGIN',
      details: 'Successful login with MFA',
      ipAddress: '192.168.1.50'
    },
    {
      id: '3',
      timestamp: new Date(2026, 3, 6, 8, 45),
      userId: 'U003',
      userName: 'Ahmed Ali',
      action: 'BOOK_APPOINTMENT',
      details: 'Scheduled appointment with Dr. Sarah Alabkari',
      ipAddress: '192.168.1.120'
    }
  ]);

  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P001',
      name: 'Ahmed Ali',
      dateOfBirth: '1990-05-15',
      email: 'ahmed.ali@email.com',
      phone: '+966 50 123 4567',
      medicalHistory: [
        {
          id: 'MR001',
          date: '2026-03-15',
          diagnosis: 'Hypertension',
          treatment: 'Prescribed medication and lifestyle changes',
          doctorName: 'Dr. Sarah Alabkari',
          notes: 'Patient responding well to treatment'
        },
        {
          id: 'MR002',
          date: '2026-02-10',
          diagnosis: 'Annual Checkup',
          treatment: 'Routine examination',
          doctorName: 'Dr. Sarah Alabkari',
          notes: 'All vitals normal'
        }
      ],
      appointments: [
        {
          id: 'A001',
          patientId: 'P001',
          patientName: 'Ahmed Ali',
          doctorId: 'D001',
          doctorName: 'Dr. Sarah Alabkari',
          date: '2026-04-15',
          time: '10:00 AM',
          type: 'in-person',
          status: 'scheduled'
        }
      ],
      prescriptions: [
        {
          id: 'RX001',
          patientId: 'P001',
          medication: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          doctorName: 'Dr. Sarah Alabkari',
          date: '2026-03-15'
        }
      ]
    }
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'A001',
      patientId: 'P001',
      patientName: 'Ahmed Ali',
      doctorId: 'D001',
      doctorName: 'Dr. Sarah Alabkari',
      date: '2026-04-15',
      time: '10:00 AM',
      type: 'in-person',
      status: 'scheduled'
    },
    {
      id: 'A002',
      patientId: 'P002',
      patientName: 'Fatima Hassan',
      doctorId: 'D001',
      doctorName: 'Dr. Sarah Alabkari',
      date: '2026-04-15',
      time: '02:00 PM',
      type: 'telemedicine',
      status: 'scheduled'
    }
  ]);

  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;

    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255)
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    addAuditLog('LOGIN', `Successful login with MFA verification`);
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog('LOGOUT', 'User logged out');
    }
    setCurrentUser(null);
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, ...updates } : p)
    );
  };

  const addPatient = (patient: Patient) => {
    setPatients(prev => [...prev, patient]);
    addAuditLog('PATIENT_REGISTERED', `New patient registered: ${patient.name}`);
  };

  const bookAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
    addAuditLog('BOOK_APPOINTMENT', `Appointment scheduled for ${appointment.patientName} with ${appointment.doctorName}`);
  };

  // Show landing page if not logged in and on landing view
  if (!currentUser && currentView === 'landing') {
    return (
      <LandingPage
        onNavigateToLogin={() => setCurrentView('login')}
        onNavigateToSignup={() => setCurrentView('signup')}
      />
    );
  }

  // Show login screen
  if (!currentUser && currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} onBackToLanding={() => setCurrentView('landing')} />;
  }

  // Show signup/registration screen
  if (!currentUser && currentView === 'signup') {
    return <PatientRegistration onBackToLanding={() => setCurrentView('landing')} />;
  }

  // User is logged in - show dashboard
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">As-Shifa Healthcare</h1>
                <p className="text-xs text-muted-foreground">Secure Management System</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Security Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Encrypted Session</span>
              </div>

              {/* User Info */}
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-8 max-w-[1600px] mx-auto">
        {currentUser.role === 'patient' && (
          <PatientDashboard
            patient={patients[0]}
            onUpdatePatient={updatePatient}
            onBookAppointment={bookAppointment}
            addAuditLog={addAuditLog}
          />
        )}
        {currentUser.role === 'doctor' && (
          <DoctorDashboard
            patients={patients}
            appointments={appointments}
            onUpdatePatient={updatePatient}
            addAuditLog={addAuditLog}
          />
        )}
        {currentUser.role === 'admin' && (
          <AdminDashboard
            auditLogs={auditLogs}
            patients={patients}
            appointments={appointments}
            addAuditLog={addAuditLog}
          />
        )}
      </main>
    </div>
  );
}
