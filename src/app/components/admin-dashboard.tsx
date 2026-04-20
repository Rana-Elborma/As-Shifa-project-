import { useState } from 'react';
import { Shield, Activity, Users, Database, AlertTriangle, CheckCircle2, Search, Filter } from 'lucide-react';
import type { AuditLogEntry, Patient, Appointment } from '../App';

interface AdminDashboardProps {
  auditLogs: AuditLogEntry[];
  patients: Patient[];
  appointments: Appointment[];
  addAuditLog: (action: string, details: string) => void;
}

export function AdminDashboard({ auditLogs, patients, appointments, addAuditLog }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'users' | 'security' | 'system'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const tabs = [
    { id: 'audit' as const, label: 'Audit Logs', icon: Activity },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'system' as const, label: 'System Health', icon: Database }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actionTypes = Array.from(new Set(auditLogs.map(log => log.action)));

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return 'text-green-700 bg-green-50';
    if (action.includes('VIEW')) return 'text-blue-700 bg-blue-50';
    if (action.includes('UPDATE') || action.includes('ISSUE')) return 'text-orange-700 bg-orange-50';
    if (action.includes('DELETE')) return 'text-red-700 bg-red-50';
    return 'text-gray-700 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">System Administration</h2>
            <p className="text-muted-foreground">Monitor system activity and manage security</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Activity className="w-8 h-8 text-primary mb-3" />
          <p className="text-2xl font-bold text-foreground">{auditLogs.length}</p>
          <p className="text-sm text-muted-foreground">Total Audit Logs</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Users className="w-8 h-8 text-secondary mb-3" />
          <p className="text-2xl font-bold text-foreground">{patients.length + 3}</p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Shield className="w-8 h-8 text-green-600 mb-3" />
          <p className="text-2xl font-bold text-foreground">100%</p>
          <p className="text-sm text-muted-foreground">Security Score</p>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <Database className="w-8 h-8 text-purple-600 mb-3" />
          <p className="text-2xl font-bold text-foreground">99.9%</p>
          <p className="text-sm text-muted-foreground">Uptime</p>
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
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">Audit Trail</h3>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-12 pr-4 py-2 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="pl-12 pr-4 py-2 rounded-xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none appearance-none"
                  >
                    <option value="all">All Actions</option>
                    {actionTypes.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>🔒 Accountability:</strong> All system actions are logged and cannot be modified or deleted by regular users. Logs are encrypted and stored securely.
              </p>
            </div>

            <div className="space-y-3">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-5 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                        {log.userName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground">{log.userName}</p>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-white/40">
                    <span>User ID: {log.userId}</span>
                    <span>•</span>
                    <span>IP: {log.ipAddress}</span>
                    <span>•</span>
                    <span>Log ID: {log.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-foreground">User Management</h3>
              <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium">
                <Users className="w-4 h-4 inline mr-2" />
                Add New User
              </button>
            </div>

            <div className="space-y-4">
              {[
                { id: 'P001', name: 'Ahmed Ali', role: 'Patient', email: 'patient@asshifa.com', status: 'Active', lastLogin: '2026-04-06 09:30' },
                { id: 'D001', name: 'Dr. Sarah Alabkari', role: 'Doctor', email: 'doctor@asshifa.com', status: 'Active', lastLogin: '2026-04-06 08:00' },
                { id: 'A001', name: 'Admin User', role: 'Administrator', email: 'admin@asshifa.com', status: 'Active', lastLogin: '2026-04-06 07:45' }
              ].map(user => (
                <div key={user.id} className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 mb-2">
                        {user.status}
                      </span>
                      <p className="text-xs text-muted-foreground">Last login:</p>
                      <p className="text-xs text-foreground">{user.lastLogin}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/40">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-sm font-medium transition-all">
                      Edit Permissions
                    </button>
                    <button className="flex-1 px-4 py-2 rounded-lg bg-white/50 hover:bg-white/80 text-sm font-medium transition-all">
                      View Activity
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all">
                      Disable
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">Security Status</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">Multi-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Enabled for all users</p>
                  </div>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">Data Encryption</h4>
                    <p className="text-sm text-muted-foreground">256-bit AES encryption</p>
                  </div>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">Access Control</h4>
                    <p className="text-sm text-muted-foreground">Role-based permissions</p>
                  </div>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-foreground">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">Comprehensive tracking</p>
                  </div>
                </div>
                <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
              <h4 className="font-semibold text-foreground mb-4">Recent Security Events</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">No security threats detected</p>
                    <p className="text-xs text-green-700">Last scan: 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">All failed login attempts within normal range</p>
                    <p className="text-xs text-blue-700">0 failed attempts in last 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground mb-4">System Health</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <Database className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Database Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
                <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <Activity className="w-8 h-8 text-secondary mb-3" />
                <p className="text-sm text-muted-foreground mb-2">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '99.9%' }}></div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
                <Shield className="w-8 h-8 text-green-600 mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Security Status</p>
                <p className="text-2xl font-bold text-green-600">Secure</p>
                <div className="mt-3 h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 border border-white/40 shadow-lg">
              <h4 className="font-semibold text-foreground mb-4">System Statistics</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Patients</p>
                  <p className="text-3xl font-bold text-foreground">{patients.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Appointments</p>
                  <p className="text-3xl font-bold text-foreground">{appointments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Database Size</p>
                  <p className="text-3xl font-bold text-foreground">2.4 GB</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">API Response Time</p>
                  <p className="text-3xl font-bold text-foreground">45ms</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2">🔒 Compliance Status</h4>
              <p className="text-sm text-muted-foreground">
                The system is HIPAA compliant and meets all data privacy regulations. All patient data is encrypted at rest and in transit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
