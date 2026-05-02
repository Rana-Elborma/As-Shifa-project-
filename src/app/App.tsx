import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginScreen } from './components/LoginScreen';
import { PatientRegistration } from './components/patient-registration';
import { PatientDashboard } from './components/patient-dashboard';
import { DoctorDashboard } from './components/doctor-dashboard';
import { AdminDashboard } from './components/admin-dashboard';
import { Heart } from 'lucide-react';
import { supabase } from '../supabase';
import type { User, UserRole, Patient, Appointment, AuditLogEntry } from './types';

// As-Shifa Secure Healthcare Management System
export type { User, UserRole, Patient, Appointment, AuditLogEntry };
export type ViewMode = 'landing' | 'login' | 'signup';

/**
 * UTILITY: Sorts appointments chronologically by date and then by time
 */
const sortAppointments = (apts: Appointment[]) => {
  return [...apts].sort((a, b) => {
    // 1. Sort by Date
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    
    // 2. Sort by Time (e.g., "09:00 AM")
    const parseTime = (t: string) => {
      if (!t) return 0;
      const [time, period] = t.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };
    return parseTime(a.time) - parseTime(b.time);
  });
};

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback object for safe rendering if data is missing
  const emptyPatient: Patient = {
    id: 'NA',
    name: 'User',
    dateOfBirth: '',
    email: '',
    phone: '',
    medicalHistory: [],
    appointments: [],
    prescriptions: []
  };

  // --- DATABASE SYNC ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [patientsRes, appointmentsRes, logsRes] = await Promise.all([
          supabase.from('patients').select('*'),
          supabase.from('appointments').select('*'),
          supabase.from('audit_logs').select('*').order('created_at', { ascending: false })
        ]);

        if (patientsRes.data) {
          const fetchedPatients = patientsRes.data.map(p => ({
            id: p.id,
            name: p.name,
            dateOfBirth: p.date_of_birth,
            email: p.email,
            phone: p.phone,
            medicalHistory: [], 
            appointments: [],
            prescriptions: []
          }));

          // T3: Add demo patient Fatima Hassan (P002) as a "real" demo user
          const fatima: Patient = {
            id: 'P002',
            name: 'Fatima Hassan',
            dateOfBirth: '1995-08-20',
            email: 'patient2@asshifa.com',
            phone: '+966-55-123-4567',
            medicalHistory: [],
            appointments: [],
            prescriptions: []
          };

          const finalPatients = fetchedPatients.some(p => p.id === 'P002') 
            ? fetchedPatients 
            : [...fetchedPatients, fatima];
            
          setPatients(finalPatients);
        }
        
        if (appointmentsRes.data && patientsRes.data) {
          const fetchedAppointments: Appointment[] = appointmentsRes.data.map(a => {
            const patient = patientsRes.data?.find(p => p.id === a.patient_id);
            return {
              id: a.id,
              patientId: a.patient_id,
              patientName: patient ? patient.name : 'Unknown Patient',
              doctorId: 'D001',
              doctorName: a.doctor_name,
              date: a.appointment_date,
              time: a.appointment_time,
              type: a.type as any,
              status: a.status as any
            };
          });

          const finalAppointments = sortAppointments(fetchedAppointments);
          setAppointments(finalAppointments);

          setPatients(prevPatients => prevPatients.map(p => ({
            ...p,
            appointments: finalAppointments.filter(apt => apt.patientId === p.id)
          })));
        }

        if (logsRes.data) {
          setAuditLogs(logsRes.data.map(log => ({
            id: log.id,
            timestamp: new Date(log.created_at),
            userId: 'U000',
            userName: log.user_name,
            action: log.action,
            details: log.details,
            ipAddress: log.ip_address
          })));
        }
      } catch (error) {
        console.error('Database Connection Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    if (currentUser) addAuditLog('LOGOUT', 'User logged out');
    setCurrentUser(null);
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, ...updates } : p)
    );
  };

  const bookAppointment = async (appointment: Appointment) => {
    const dbAppointment = {
      patient_id: appointment.patientId,
      doctor_name: appointment.doctorName,
      appointment_date: appointment.date,
      appointment_time: appointment.time,
      type: appointment.type,
      status: appointment.status
    };

    const { data } = await supabase.from('appointments').insert([dbAppointment]).select();

    if (data) {
      const savedAppointment = { ...appointment, id: data[0].id };
      setAppointments(prev => sortAppointments([...prev, savedAppointment]));
      setPatients(prev => prev.map(p => 
        p.id === dbAppointment.patient_id
          ? { ...p, appointments: sortAppointments([...(p.appointments || []), savedAppointment]) } 
          : p
      ));
      addAuditLog('BOOK_APPOINTMENT', `Scheduled ${appointment.type} with ${appointment.doctorName}`);
    }
  };

  if (!currentUser && currentView === 'landing') {
    return <LandingPage onNavigateToLogin={() => setCurrentView('login')} onNavigateToSignup={() => setCurrentView('signup')} />;
  }

  if (!currentUser && currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} onBackToLanding={() => setCurrentView('landing')} />;
  }

  if (!currentUser && currentView === 'signup') {
    return <PatientRegistration onBackToLanding={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2.5 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">As-Shifa Healthcare</h1>
                <p className="text-xs text-muted-foreground">Secure Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">Encrypted Session</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 pb-8 max-w-[1600px] mx-auto">
        {currentUser.role === 'patient' && (
          <PatientDashboard
            patient={patients.find(p => p.id === currentUser.id) || patients[0] || emptyPatient}
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
