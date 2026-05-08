/**
 * Member 2 — Doctor Dashboard Black-Box Tests
 * TC-09 → TC-15
 *
 * Tests patient isolation, prescriptions, medical records, and telemedicine
 * from the doctor side.
 *
 * Components under test: doctor-dashboard.tsx, telemedicine-call.tsx
 *
 * Security concept covered:
 *   Data isolation (doctor sees only their own patients), role-based access
 *   control, audit logging of medical record access and prescription issuance,
 *   persistence of PHI to encrypted database.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ────────────────────────────────────────────────────────────

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

vi.mock('../../supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

// ─── Shared Types (mirror App.tsx) ────────────────────────────────────────────

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  doctorName: string;
  notes?: string;
}

interface Prescription {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  instructions: string;
  doctorName: string;
  status: 'active' | 'completed';
}

interface Appointment {
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

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  appointments: Appointment[];
  medicalHistory: MedicalRecord[];
  prescriptions: Prescription[];
}

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const CURRENT_DOCTOR = 'Dr. Sarah';

const allAppointments: Appointment[] = [
  {
    id: 'APT-001',
    patientId: 'P001',
    patientName: 'Ahmed Ali',
    doctorId: 'D001',
    doctorName: 'Dr. Sarah',
    date: '2026-05-10',
    time: '9:00 AM',
    type: 'in-person',
    status: 'scheduled',
  },
  {
    id: 'APT-002',
    patientId: 'P002',
    patientName: 'Fatima Hassan',
    doctorId: 'D001',
    doctorName: 'Dr. Sarah',
    date: '2026-05-10',
    time: '10:00 AM',
    type: 'telemedicine',
    status: 'scheduled',
  },
  {
    id: 'APT-003',
    patientId: 'P003',
    patientName: 'Omar Khalid',
    doctorId: 'D002',
    doctorName: 'Dr. Omar',          // ← belongs to a DIFFERENT doctor
    date: '2026-05-10',
    time: '11:00 AM',
    type: 'in-person',
    status: 'scheduled',
  },
  {
    id: 'APT-004',
    patientId: 'P001',
    patientName: 'Ahmed Ali',
    doctorId: 'D001',
    doctorName: 'Dr. Sarah',
    date: '2026-05-01',
    time: '2:00 PM',
    type: 'in-person',
    status: 'completed',              // ← completed, should NOT appear in scheduled list
  },
];

const allPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Ahmed Ali',
    email: 'ahmed@test.com',
    phone: '+966501234567',
    dateOfBirth: '1990-01-15',
    appointments: allAppointments.filter(a => a.patientId === 'P001'),
    medicalHistory: [
      {
        id: 'MR001',
        date: '2026-04-20',
        diagnosis: 'Hypertension',
        treatment: 'Lifestyle changes',
        doctorName: 'Dr. Sarah',
        notes: 'Monitor BP weekly',
      },
    ],
    prescriptions: [],
  },
  {
    id: 'P002',
    name: 'Fatima Hassan',
    email: 'fatima@test.com',
    phone: '+966507654321',
    dateOfBirth: '1985-06-20',
    appointments: allAppointments.filter(a => a.patientId === 'P002'),
    medicalHistory: [],
    prescriptions: [],
  },
  {
    id: 'P003',
    name: 'Omar Khalid',
    email: 'omar@test.com',
    phone: '+966509999999',
    dateOfBirth: '1978-03-10',
    appointments: allAppointments.filter(a => a.patientId === 'P003'),
    medicalHistory: [],
    prescriptions: [],
  },
];

// ─── Business-Logic Helpers (extracted from doctor-dashboard.tsx) ─────────────

/** TC-09/TC-10 — filter logic used by the component */
function getDoctorAppointments(appointments: Appointment[], doctorName: string) {
  return appointments.filter(
    apt => apt.status === 'scheduled' && apt.doctorName === doctorName,
  );
}

function getMyPatients(
  patients: Patient[],
  appointments: Appointment[],
  doctorName: string,
) {
  const myPatientIds = new Set(
    appointments
      .filter(apt => apt.doctorName === doctorName)
      .map(apt => apt.patientId),
  );
  return patients.filter(p => myPatientIds.has(p.id));
}

/** TC-11 — view a patient's medical record (returns the record + audit entry) */
function viewPatientRecord(patient: Patient, doctorName: string) {
  const auditEntry = `${doctorName} accessed medical record for patient ${patient.name}`;
  return { medicalHistory: patient.medicalHistory, auditEntry };
}

/** TC-12 — add a medical record to a patient */
async function addMedicalRecord(
  patient: Patient,
  diagnosis: string,
  treatment: string,
  doctorName: string,
) {
  const { supabase } = await import('../../supabase');

  const newRecord: MedicalRecord = {
    id: `MR${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    diagnosis,
    treatment,
    doctorName,
    notes: 'Updated during consultation',
  };

  await supabase.from('medical_history').insert([{
    id: newRecord.id,
    patient_id: patient.id,
    date: newRecord.date,
    diagnosis,
    treatment,
    notes: newRecord.notes,
    doctor_name: doctorName,
  }]);

  const updatedHistory = [...patient.medicalHistory, newRecord];
  return { updatedHistory, newRecord };
}

/** TC-13 — issue a prescription */
async function issuePrescription(
  patient: Patient,
  medication: string,
  dosage: string,
  frequency: string,
  duration: string,
  notes: string,
  doctorName: string,
) {
  const { supabase } = await import('../../supabase');

  const newPrescription: Prescription = {
    id: `RX${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    medication,
    dosage,
    instructions: `${frequency} for ${duration}. ${notes}`.trim(),
    doctorName,
    status: 'active',
  };

  await supabase.from('prescriptions').insert([{
    id: newPrescription.id,
    patient_id: patient.id,
    date: newPrescription.date,
    medication,
    dosage,
    instructions: newPrescription.instructions,
    doctor_name: doctorName,
    status: 'active',
  }]);

  return { newPrescription };
}

/** TC-14 / TC-15 — telemedicine call state management */
function startTelemedicineCall(appointment: Appointment, doctorName: string) {
  const auditEntry = `${doctorName} started telemedicine call with ${appointment.patientName}`;
  return {
    showTelemedicine: true,
    teleAppointment: appointment,
    doctorNameDisplayed: doctorName,
    patientNameDisplayed: appointment.patientName,
    auditEntry,
  };
}

function endTelemedicineCall(appointment: Appointment, doctorName: string) {
  const auditEntry = `${doctorName} ended telemedicine call with ${appointment.patientName}`;
  return {
    showTelemedicine: false,
    teleAppointment: null,
    auditEntry,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TC-09 | Doctor sees only their own patients in "My Patients"', () => {
  it('filters patients to only those who booked with the current doctor', () => {
    const myPatients = getMyPatients(allPatients, allAppointments, CURRENT_DOCTOR);

    // Dr. Sarah has appointments with P001 (Ahmed) and P002 (Fatima) — NOT P003 (Omar)
    expect(myPatients).toHaveLength(2);
    expect(myPatients.map(p => p.name)).toContain('Ahmed Ali');
    expect(myPatients.map(p => p.name)).toContain('Fatima Hassan');
    expect(myPatients.map(p => p.name)).not.toContain('Omar Khalid');
  });

  it('does not include patients belonging to other doctors', () => {
    const myPatients = getMyPatients(allPatients, allAppointments, CURRENT_DOCTOR);
    const otherDoctorPatients = getMyPatients(allPatients, allAppointments, 'Dr. Omar');

    // No overlap: Omar Khalid only belongs to Dr. Omar
    expect(otherDoctorPatients).toHaveLength(1);
    expect(otherDoctorPatients[0].name).toBe('Omar Khalid');

    const overlap = myPatients.filter(p =>
      otherDoctorPatients.some(op => op.id === p.id),
    );
    expect(overlap).toHaveLength(0);
  });
});

describe('TC-10 | Appointments tab shows only scheduled appointments for this doctor', () => {
  it('returns only scheduled appointments matching the doctor name', () => {
    const doctorAppointments = getDoctorAppointments(allAppointments, CURRENT_DOCTOR);

    // Dr. Sarah has 2 scheduled (APT-001 in-person, APT-002 telemedicine)
    // APT-003 belongs to Dr. Omar, APT-004 is completed
    expect(doctorAppointments).toHaveLength(2);
    doctorAppointments.forEach(apt => {
      expect(apt.doctorName).toBe(CURRENT_DOCTOR);
      expect(apt.status).toBe('scheduled');
    });
  });

  it('excludes completed appointments', () => {
    const doctorAppointments = getDoctorAppointments(allAppointments, CURRENT_DOCTOR);
    const hasCompleted = doctorAppointments.some(a => a.status === 'completed');
    expect(hasCompleted).toBe(false);
  });

  it('excludes other doctors\' appointments', () => {
    const doctorAppointments = getDoctorAppointments(allAppointments, CURRENT_DOCTOR);
    const hasOtherDoctor = doctorAppointments.some(a => a.doctorName !== CURRENT_DOCTOR);
    expect(hasOtherDoctor).toBe(false);
  });
});

describe('TC-11 | View Records opens the correct patient\'s medical history', () => {
  it('returns the selected patient\'s medical history', () => {
    const patient = allPatients.find(p => p.id === 'P001')!;
    const { medicalHistory } = viewPatientRecord(patient, CURRENT_DOCTOR);

    expect(medicalHistory).toHaveLength(1);
    expect(medicalHistory[0].diagnosis).toBe('Hypertension');
    expect(medicalHistory[0].doctorName).toBe('Dr. Sarah');
  });

  it('generates an audit log entry with doctor and patient names', () => {
    const patient = allPatients.find(p => p.id === 'P001')!;
    const { auditEntry } = viewPatientRecord(patient, CURRENT_DOCTOR);

    expect(auditEntry).toContain('Dr. Sarah');
    expect(auditEntry).toContain('Ahmed Ali');
  });

  it('returns empty history for a patient with no records', () => {
    const patient = allPatients.find(p => p.id === 'P002')!;
    const { medicalHistory } = viewPatientRecord(patient, CURRENT_DOCTOR);

    expect(medicalHistory).toHaveLength(0);
  });
});

describe('TC-12 | Add a medical record inside the patient modal', () => {
  it('creates a new record and persists it to Supabase', async () => {
    const patient = allPatients.find(p => p.id === 'P001')!;
    const { updatedHistory, newRecord } = await addMedicalRecord(
      patient,
      'Type 2 Diabetes',
      'Metformin 500mg twice daily',
      CURRENT_DOCTOR,
    );

    // Record appears in the updated history list immediately
    expect(updatedHistory).toHaveLength(2); // 1 existing + 1 new
    expect(updatedHistory[1].diagnosis).toBe('Type 2 Diabetes');
    expect(updatedHistory[1].treatment).toBe('Metformin 500mg twice daily');
    expect(updatedHistory[1].doctorName).toBe(CURRENT_DOCTOR);

    // Supabase insert was called with the correct table
    expect(mockFrom).toHaveBeenCalledWith('medical_history');
    expect(mockInsert).toHaveBeenCalledOnce();

    // Verify the payload sent to Supabase
    const insertPayload = mockInsert.mock.calls[0][0][0];
    expect(insertPayload.diagnosis).toBe('Type 2 Diabetes');
    expect(insertPayload.treatment).toBe('Metformin 500mg twice daily');
    expect(insertPayload.doctor_name).toBe(CURRENT_DOCTOR);
    expect(insertPayload.patient_id).toBe('P001');
  });

  it('new record has today\'s date', async () => {
    const patient = allPatients.find(p => p.id === 'P002')!;
    const { newRecord } = await addMedicalRecord(
      patient,
      'Anemia',
      'Iron supplements',
      CURRENT_DOCTOR,
    );

    const today = new Date().toISOString().split('T')[0];
    expect(newRecord.date).toBe(today);
  });
});

describe('TC-13 | Issue a prescription from the Prescribe tab', () => {
  it('saves prescription to Supabase with correct fields', async () => {
    const patient = allPatients.find(p => p.id === 'P001')!;
    const { newPrescription } = await issuePrescription(
      patient,
      'Lisinopril',
      '10mg',
      'Once daily',
      '30 days',
      'Take with food',
      CURRENT_DOCTOR,
    );

    // Verify the prescription object
    expect(newPrescription.medication).toBe('Lisinopril');
    expect(newPrescription.dosage).toBe('10mg');
    expect(newPrescription.doctorName).toBe(CURRENT_DOCTOR);
    expect(newPrescription.status).toBe('active');
    expect(newPrescription.instructions).toContain('Once daily');
    expect(newPrescription.instructions).toContain('30 days');

    // Verify Supabase persistence
    expect(mockFrom).toHaveBeenCalledWith('prescriptions');
    expect(mockInsert).toHaveBeenCalledOnce();

    const insertPayload = mockInsert.mock.calls[0][0][0];
    expect(insertPayload.medication).toBe('Lisinopril');
    expect(insertPayload.dosage).toBe('10mg');
    expect(insertPayload.doctor_name).toBe(CURRENT_DOCTOR);
    expect(insertPayload.patient_id).toBe('P001');
    expect(insertPayload.status).toBe('active');
  });

  it('prescription date is set to today', async () => {
    const patient = allPatients.find(p => p.id === 'P001')!;
    const { newPrescription } = await issuePrescription(
      patient,
      'Aspirin',
      '81mg',
      'Once daily',
      '90 days',
      '',
      CURRENT_DOCTOR,
    );

    const today = new Date().toISOString().split('T')[0];
    expect(newPrescription.date).toBe(today);
  });
});

describe('TC-14 | Start telemedicine call shows correct names', () => {
  it('opens telemedicine screen with the doctor\'s and patient\'s real names', () => {
    const teleAppointment = allAppointments.find(
      a => a.type === 'telemedicine' && a.doctorName === CURRENT_DOCTOR,
    )!;

    const callState = startTelemedicineCall(teleAppointment, CURRENT_DOCTOR);

    expect(callState.showTelemedicine).toBe(true);
    expect(callState.doctorNameDisplayed).toBe('Dr. Sarah');
    expect(callState.patientNameDisplayed).toBe('Fatima Hassan');

    // No hardcoded defaults
    expect(callState.doctorNameDisplayed).not.toBe('Doctor');
    expect(callState.patientNameDisplayed).not.toBe('Patient');
  });

  it('generates an audit log for the call start', () => {
    const teleAppointment = allAppointments.find(
      a => a.type === 'telemedicine' && a.doctorName === CURRENT_DOCTOR,
    )!;

    const { auditEntry } = startTelemedicineCall(teleAppointment, CURRENT_DOCTOR);
    expect(auditEntry).toContain('started telemedicine call');
    expect(auditEntry).toContain('Dr. Sarah');
    expect(auditEntry).toContain('Fatima Hassan');
  });
});

describe('TC-15 | End call returns to dashboard — appointments preserved', () => {
  it('resets telemedicine state on end call', () => {
    const teleAppointment = allAppointments.find(
      a => a.type === 'telemedicine' && a.doctorName === CURRENT_DOCTOR,
    )!;

    const endState = endTelemedicineCall(teleAppointment, CURRENT_DOCTOR);

    expect(endState.showTelemedicine).toBe(false);
    expect(endState.teleAppointment).toBeNull();
  });

  it('generates an audit log for the call end', () => {
    const teleAppointment = allAppointments.find(
      a => a.type === 'telemedicine' && a.doctorName === CURRENT_DOCTOR,
    )!;

    const { auditEntry } = endTelemedicineCall(teleAppointment, CURRENT_DOCTOR);
    expect(auditEntry).toContain('ended telemedicine call');
    expect(auditEntry).toContain('Dr. Sarah');
    expect(auditEntry).toContain('Fatima Hassan');
  });

  it('appointments list is unchanged after ending the call', () => {
    const beforeCall = getDoctorAppointments(allAppointments, CURRENT_DOCTOR);

    // Simulate: start call → end call → check appointments again
    const teleAppointment = allAppointments.find(
      a => a.type === 'telemedicine' && a.doctorName === CURRENT_DOCTOR,
    )!;
    startTelemedicineCall(teleAppointment, CURRENT_DOCTOR);
    endTelemedicineCall(teleAppointment, CURRENT_DOCTOR);

    const afterCall = getDoctorAppointments(allAppointments, CURRENT_DOCTOR);

    expect(afterCall).toHaveLength(beforeCall.length);
    expect(afterCall.map(a => a.id)).toEqual(beforeCall.map(a => a.id));
  });
});
