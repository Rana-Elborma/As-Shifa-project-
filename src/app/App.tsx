import { useState, useEffect, useCallback } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/LoginScreen";
import { PatientRegistration } from "./components/patient-registration";
import { PatientDashboard } from "./components/patient-dashboard";
import { DoctorDashboard } from "./components/doctor-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";
import { Heart, Calendar, UserPlus } from "lucide-react";
import { supabase } from "../supabase";
import type {
  User,
  UserRole,
  Patient,
  Appointment,
  AuditLogEntry,
} from "./types";

export type { User, UserRole, Patient, Appointment, AuditLogEntry };
export type ViewMode = "landing" | "login" | "signup";

const sortAppointments = (apts: Appointment[]) => {
  return [...apts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    const parseTime = (t: string) => {
      if (!t) return 0;
      const [time, period] = t.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + (minutes || 0);
    };
    return parseTime(a.time) - parseTime(b.time);
  });
};

function ReceptionistDashboard({
  appointments,
  onRegisterPatient,
}: {
  appointments: Appointment[];
  onRegisterPatient: () => void;
}) {
  const today = new Date().toISOString().split("T")[0];

  const todaysAppointments = appointments.filter(
    (appointment) => appointment.date === today,
  );

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Receptionist Dashboard
            </h2>
            <p className="text-muted-foreground">
              View today&apos;s appointments and register new patients.
            </p>
          </div>

          <button
            onClick={onRegisterPatient}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-lg transition-all"
          >
            <UserPlus className="w-5 h-5" />
            Register New Patient
          </button>
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">
            Today&apos;s Appointments
          </h3>
        </div>

        {todaysAppointments.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/70 border border-white/40 text-center text-muted-foreground">
            No appointments scheduled for today.
          </div>
        ) : (
          <div className="space-y-4">
            {todaysAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-5 rounded-2xl bg-white/70 border border-white/40 shadow-lg"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-lg text-foreground">
                      {appointment.patientName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Doctor: {appointment.doctorName}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Type: {appointment.type}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {appointment.time}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      {appointment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Principle of Least Privilege:</strong> Receptionists can
            only view today&apos;s appointment schedule and register new
            patients. Medical history, prescriptions, and admin controls are
            intentionally hidden.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>("landing");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Extracted so it can be called both on mount and after login
  const fetchData = useCallback(async () => {
    try {
      const [
        patientsRes,
        appointmentsRes,
        logsRes,
        historyRes,
        prescriptionsRes,
      ] = await Promise.all([
        supabase.from("patients").select("*"),
        supabase.from("appointments").select("*"),
        supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("medical_history")
          .select("*")
          .order("date", { ascending: false }),
        supabase
          .from("prescriptions")
          .select("*")
          .order("date", { ascending: false }),
      ]);

      if (patientsRes.data) {
        const fetchedPatients: Patient[] = patientsRes.data.map((p) => ({
          id: p.id,
          name: p.name,
          dateOfBirth: p.date_of_birth ?? "",
          email: p.email ?? "",
          phone: p.phone ?? "",
          medicalHistory: (historyRes.data ?? [])
            .filter((h) => h.patient_id === p.id)
            .map((h) => ({
              id: h.id,
              date: h.date,
              diagnosis: h.diagnosis,
              treatment: h.treatment,
              notes: h.notes ?? "",
              doctorName: h.doctor_name,
            })),
          prescriptions: (prescriptionsRes.data ?? [])
            .filter((rx) => rx.patient_id === p.id)
            .map((rx) => ({
              id: rx.id,
              date: rx.date,
              medication: rx.medication,
              dosage: rx.dosage ?? "",
              instructions: rx.instructions ?? "",
              doctorName: rx.doctor_name,
              status: rx.status as "active" | "completed",
            })),
          appointments: [],
        }));

        if (appointmentsRes.data) {
          const fetchedAppointments: Appointment[] = appointmentsRes.data.map(
            (a) => {
              const patient = patientsRes.data.find(
                (p) => p.id === a.patient_id,
              );
              return {
                id: a.id,
                patientId: a.patient_id,
                patientName: patient ? patient.name : "Unknown Patient",
                doctorId: "D001",
                doctorName: a.doctor_name,
                date: a.appointment_date,
                time: a.appointment_time,
                type: a.type as any,
                status: a.status as any,
              };
            },
          );

          const sorted = sortAppointments(fetchedAppointments);
          setAppointments(sorted);

          setPatients(
            fetchedPatients.map((p) => ({
              ...p,
              appointments: sorted.filter((apt) => apt.patientId === p.id),
            })),
          );
        } else {
          setPatients(fetchedPatients);
        }
      }

      if (logsRes.data) {
        setAuditLogs(
          logsRes.data.map((log) => ({
            id: log.id,
            timestamp: new Date(log.created_at),
            userId: log.user_id ?? "",
            userName: log.user_name ?? "",
            action: log.action,
            details: log.details,
            ipAddress: log.ip_address ?? "",
          })),
        );
      }
    } catch (error) {
      console.error("Database Connection Error:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      ipAddress: "192.168.1." + Math.floor(Math.random() * 255),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setRegistrationSuccess(false);
    // Refetch so a newly registered user sees their own data immediately
    await fetchData();
  };

  const handleLogout = () => {
    if (currentUser) addAuditLog("LOGOUT", "User logged out");
    setCurrentUser(null);
  };

  const updatePatient = (patientId: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, ...updates } : p)),
    );
  };

  const bookAppointment = async (appointment: Appointment) => {
    const dbAppointment = {
      patient_id: appointment.patientId,
      doctor_name: appointment.doctorName,
      appointment_date: appointment.date,
      appointment_time: appointment.time,
      type: appointment.type,
      status: appointment.status,
    };

    const { data } = await supabase
      .from("appointments")
      .insert([dbAppointment])
      .select();

    if (data) {
      const savedAppointment = { ...appointment, id: data[0].id };
      setAppointments((prev) => sortAppointments([...prev, savedAppointment]));
      setPatients((prev) =>
        prev.map((p) =>
          p.id === dbAppointment.patient_id
            ? {
                ...p,
                appointments: sortAppointments([
                  ...(p.appointments || []),
                  savedAppointment,
                ]),
              }
            : p,
        ),
      );
      addAuditLog(
        "BOOK_APPOINTMENT",
        `Scheduled ${appointment.type} with ${appointment.doctorName}`,
      );
    }
  };

  if (!currentUser && currentView === "landing") {
    return (
      <LandingPage
        onNavigateToLogin={() => setCurrentView("login")}
        onNavigateToSignup={() => setCurrentView("signup")}
      />
    );
  }

  if (!currentUser && currentView === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onBackToLanding={() => setCurrentView("landing")}
        registrationSuccess={registrationSuccess}
      />
    );
  }

  if (!currentUser && currentView === "signup") {
    return (
      <PatientRegistration
        onBackToLanding={() => setCurrentView("landing")}
        onRegistrationSuccess={() => {
          setRegistrationSuccess(true);
          setCurrentView("login");
        }}
      />
    );
  }

  // After all early returns above, currentUser is guaranteed non-null here
  if (!currentUser) return null;

  // Build the patient object for the logged-in patient.
  // Use their DB record if it exists; otherwise fall back to their auth data
  // so a newly registered user NEVER sees another patient's records.
  const loggedInPatient: Patient = patients.find(
    (p) => p.id === currentUser!.id,
  ) ?? {
    id: currentUser!.id,
    name: currentUser!.name,
    email: currentUser!.email,
    phone: "",
    dateOfBirth: "",
    medicalHistory: [],
    appointments: [],
    prescriptions: [],
  };

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
                <h1 className="font-bold text-lg text-foreground">
                  As-Shifa Healthcare
                </h1>
                <p className="text-xs text-muted-foreground">
                  Secure Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">
                  Encrypted Session
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">
                  {currentUser!.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentUser!.role}
                </p>
              </div>
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

      <main className="pt-24 px-6 pb-8 max-w-[1600px] mx-auto">
        {currentUser.role === "patient" && (
          <PatientDashboard
            patient={loggedInPatient}
            onUpdatePatient={updatePatient}
            onBookAppointment={bookAppointment}
            addAuditLog={addAuditLog}
          />
        )}

        {currentUser.role === "doctor" && (
          <DoctorDashboard
            patients={patients}
            appointments={appointments}
            onUpdatePatient={updatePatient}
            addAuditLog={addAuditLog}
            currentUserName={currentUser.name}
          />
        )}

        {currentUser.role === "admin" && (
          <AdminDashboard
            auditLogs={auditLogs}
            patients={patients}
            appointments={appointments}
            addAuditLog={addAuditLog}
          />
        )}

        {currentUser.role === "receptionist" && (
          <ReceptionistDashboard
            appointments={appointments}
            onRegisterPatient={() => setCurrentView("signup")}
          />
        )}
      </main>
    </div>
  );
}
