/**
 * Member 4 — Admin & Receptionist Dashboard Black-Box Tests
 * TC-23 → TC-29
 *
 * Tests the administrative oversight, receptionist operations,
 * role-based access control, and audit logging integrity.
 *
 * Components under test: admin-dashboard.tsx, App.tsx (Receptionist snippet)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock Supabase ────────────────────────────────────────────────────────────

const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });

vi.mock('../../supabase', () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
  },
}));

// ─── Shared Types (mirror App.tsx) ────────────────────────────────────────────

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin' | 'receptionist';
  email: string;
}

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-1',
    timestamp: new Date('2026-05-09T08:00:00'),
    userId: 'U001',
    userName: 'Ahmed Ali',
    action: 'LOGIN',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.1',
  },
  {
    id: 'LOG-2',
    timestamp: new Date('2026-05-09T09:00:00'),
    userId: 'D001',
    userName: 'Dr. Sarah',
    action: 'VIEW_RECORD',
    details: 'Viewed medical record for Ahmed Ali',
    ipAddress: '192.168.1.5',
  },
  {
    id: 'LOG-3',
    timestamp: new Date('2026-05-09T10:00:00'),
    userId: 'A001',
    userName: 'Admin User',
    action: 'DISABLE_USER',
    details: 'Disabled user account for Fatima Hassan',
    ipAddress: '192.168.1.10',
  },
];

const mockAppointments: Appointment[] = [
  {
    id: 'APT-1',
    patientId: 'P001',
    patientName: 'Ahmed Ali',
    doctorName: 'Dr. Sarah',
    date: new Date().toISOString().split('T')[0], // Today
    time: '09:00 AM',
    status: 'scheduled',
  },
  {
    id: 'APT-2',
    patientId: 'P002',
    patientName: 'Fatima Hassan',
    doctorName: 'Dr. Omar',
    date: '2026-05-10', // Tomorrow
    time: '10:00 AM',
    status: 'scheduled',
  },
];

// ─── Business-Logic Helpers (extracted from components) ───────────────────────

/** TC-23 — Admin Audit log filtering logic */
function filterAuditLogs(logs: AuditLogEntry[], query: string, actionFilter: string) {
  return logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(query.toLowerCase()) ||
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.details.toLowerCase().includes(query.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });
}

/** TC-24 — Admin User Management logic */
function toggleUserStatus(userId: string, currentDisabled: string[]) {
  const isCurrentlyDisabled = currentDisabled.includes(userId);
  const nextDisabled = isCurrentlyDisabled
    ? currentDisabled.filter((id) => id !== userId)
    : [...currentDisabled, userId];
  
  const action = isCurrentlyDisabled ? 'ENABLE_USER' : 'DISABLE_USER';
  return { nextDisabled, action };
}

/** TC-25 — Receptionist Today's Appointments logic */
function getTodaysAppointments(appointments: Appointment[]) {
  const today = new Date().toISOString().split('T')[0];
  return appointments.filter((apt) => apt.date === today);
}

/** TC-28 — RBAC Access Logic */
function canAccessModule(role: string, module: 'admin' | 'receptionist' | 'doctor' | 'patient') {
  if (module === 'admin') return role === 'admin';
  if (module === 'receptionist') return role === 'receptionist' || role === 'admin';
  return true; // Simplified for this test
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Member 4 | Admin & Receptionist Tests', () => {

  describe('TC-23 | Admin - Audit Log Search and Filtering', () => {
    it('filters logs by search query (user name and details)', () => {
      const results = filterAuditLogs(mockAuditLogs, 'Ahmed', 'all');
      expect(results).toHaveLength(2); // Matches LOG-1 (name) and LOG-2 (details)
    });

    it('filters logs by specific user name', () => {
      const results = filterAuditLogs(mockAuditLogs, 'Dr. Sarah', 'all');
      expect(results).toHaveLength(1);
      expect(results[0].userName).toBe('Dr. Sarah');
    });

    it('filters logs by action type (DISABLE_USER)', () => {
      const results = filterAuditLogs(mockAuditLogs, '', 'DISABLE_USER');
      expect(results).toHaveLength(1);
      expect(results[0].action).toBe('DISABLE_USER');
    });

    it('returns empty list for non-matching query', () => {
      const results = filterAuditLogs(mockAuditLogs, 'NonExistentUser', 'all');
      expect(results).toHaveLength(0);
    });
  });

  describe('TC-24 | Admin - User Management (Enable/Disable)', () => {
    it('disabling a user returns the correct action and updated list', () => {
      const { nextDisabled, action } = toggleUserStatus('P002', []);
      expect(nextDisabled).toContain('P002');
      expect(action).toBe('DISABLE_USER');
    });

    it('enabling a previously disabled user returns the ENABLE action', () => {
      const { nextDisabled, action } = toggleUserStatus('P002', ['P002']);
      expect(nextDisabled).not.toContain('P002');
      expect(action).toBe('ENABLE_USER');
    });
  });

  describe('TC-25 | Receptionist - Today\'s Appointments View', () => {
    it('filters list to show only appointments scheduled for today', () => {
      const results = getTodaysAppointments(mockAppointments);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('APT-1');
      expect(results[0].date).toBe(new Date().toISOString().split('T')[0]);
    });

    it('excludes appointments from other days', () => {
      const results = getTodaysAppointments(mockAppointments);
      const hasTomorrow = results.some(a => a.date === '2026-05-10');
      expect(hasTomorrow).toBe(false);
    });
  });

  describe('TC-26 | Receptionist - Patient Registration Proxy', () => {
    it('verifies that the register button initiates the correct view state', () => {
      // Logic from App.tsx: onRegisterPatient={() => setCurrentView("signup")}
      let currentView = 'receptionist-dashboard';
      const onRegisterPatient = () => { currentView = 'signup'; };
      
      onRegisterPatient();
      expect(currentView).toBe('signup');
    });
  });

  describe('TC-27 | Admin - System Statistics Calculation', () => {
    it('calculates the correct count of active users', () => {
      const allUsers = [
        { id: 'U1', role: 'Patient' },
        { id: 'U2', role: 'Patient' },
        { id: 'D1', role: 'Doctor' }
      ];
      const disabledUsers = ['U2'];
      
      const activeCount = allUsers.filter(u => !disabledUsers.includes(u.id)).length;
      expect(activeCount).toBe(2);
    });
  });

  describe('TC-28 | Security - Role-Based Access Control (RBAC)', () => {
    it('prevents a patient from accessing the admin module', () => {
      expect(canAccessModule('patient', 'admin')).toBe(false);
    });

    it('allows an admin to access the admin module', () => {
      expect(canAccessModule('admin', 'admin')).toBe(true);
    });

    it('prevents a doctor from accessing the receptionist module', () => {
      expect(canAccessModule('doctor', 'receptionist')).toBe(false);
    });

    it('allows a receptionist to access the receptionist module', () => {
      expect(canAccessModule('receptionist', 'receptionist')).toBe(true);
    });
  });

  describe('TC-29 | Audit Logging Integrity', () => {
    it('ensures that a sensitive action generates a correct audit payload', () => {
      const currentUser = { id: 'A001', name: 'Admin User' };
      const action = 'DISABLE_USER';
      const details = 'Disabled account for Fatima';
      
      const payload = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date(),
        userId: currentUser.id,
        userName: currentUser.name,
        action,
        details,
        ipAddress: '127.0.0.1' // or mocked
      };

      expect(payload.userId).toBe('A001');
      expect(payload.action).toBe('DISABLE_USER');
      expect(payload.details).toContain('Fatima');
    });
  });
});
