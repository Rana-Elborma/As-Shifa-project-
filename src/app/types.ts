/**
 * SHARED TYPES
 * These interfaces define the data structures used throughout the As-Shifa system.
 * Moving them here breaks circular dependencies between App.tsx and components.
 */

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalHistory: MedicalHistoryRecord[];
  prescriptions: Prescription[];
  appointments: Appointment[];
}

export interface MedicalHistoryRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
  doctorName: string;
}

export interface Prescription {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  instructions: string;
  doctorName: string;
  status: 'active' | 'completed';
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

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  userName: string;
  ipAddress: string;
}
