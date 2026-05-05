import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Activity,
  Search,
  AlertTriangle,
  User,
  FileText,
  Lock,
  Unlock,
  Eye,
  Download,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';

interface AuditEntry {
  id: number;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'suspicious';
  details: string;
}

const auditLogs: AuditEntry[] = [
  {
    id: 1,
    user: 'Dr. Sarah Johnson',
    action: 'Viewed Medical Record',
    resource: 'Patient #PAT-2024-00156',
    timestamp: '2026-04-05 14:32:15',
    ipAddress: '192.168.1.45',
    status: 'success',
    details: 'Accessed patient medical history',
  },
  {
    id: 2,
    user: 'Admin User',
    action: 'Updated User Permissions',
    resource: 'User #USR-789',
    timestamp: '2026-04-05 14:15:42',
    ipAddress: '192.168.1.10',
    status: 'success',
    details: 'Modified access level from User to Admin',
  },
  {
    id: 3,
    user: 'Unknown',
    action: 'Failed Login Attempt',
    resource: 'Login Portal',
    timestamp: '2026-04-05 13:58:23',
    ipAddress: '203.45.67.89',
    status: 'suspicious',
    details: 'Multiple failed login attempts detected from suspicious IP',
  },
  {
    id: 4,
    user: 'Dr. Michael Chen',
    action: 'Created Prescription',
    resource: 'Patient #PAT-2024-00234',
    timestamp: '2026-04-05 13:45:10',
    ipAddress: '192.168.1.52',
    status: 'success',
    details: 'New prescription added for antibiotics',
  },
  {
    id: 5,
    user: 'System',
    action: 'Data Backup',
    resource: 'Database',
    timestamp: '2026-04-05 13:00:00',
    ipAddress: '127.0.0.1',
    status: 'success',
    details: 'Automated daily backup completed successfully',
  },
  {
    id: 6,
    user: 'Nurse Emily Watson',
    action: 'Accessed Patient Data',
    resource: 'Patient #PAT-2024-00567',
    timestamp: '2026-04-05 12:30:45',
    ipAddress: '192.168.1.78',
    status: 'suspicious',
    details: 'Accessed records outside assigned patients list',
  },
  {
    id: 7,
    user: 'Dr. Ahmed Hassan',
    action: 'Scheduled Appointment',
    resource: 'Calendar System',
    timestamp: '2026-04-05 11:20:33',
    ipAddress: '192.168.1.61',
    status: 'success',
    details: 'New appointment created for next week',
  },
  {
    id: 8,
    user: 'John Doe',
    action: 'Updated Profile',
    resource: 'User Profile',
    timestamp: '2026-04-05 10:15:22',
    ipAddress: '192.168.1.120',
    status: 'success',
    details: 'Contact information and preferences updated',
  },
  {
    id: 9,
    user: 'Unknown',
    action: 'Failed Access Attempt',
    resource: 'Admin Dashboard',
    timestamp: '2026-04-05 09:45:11',
    ipAddress: '203.45.67.89',
    status: 'failed',
    details: 'Unauthorized access attempt blocked by firewall',
  },
  {
    id: 10,
    user: 'Dr. Emily Davis',
    action: 'Downloaded Report',
    resource: 'Medical Report #RPT-456',
    timestamp: '2026-04-05 09:10:05',
    ipAddress: '192.168.1.48',
    status: 'success',
    details: 'Lab results and analysis report downloaded',
  },
];

export function AuditLog() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const getStatusIcon = (status: AuditEntry['status']) => {
    switch (status) {
      case 'success':
        return <Shield className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <Lock className="w-4 h-4 text-red-600" />;
      case 'suspicious':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: AuditEntry['status']) => {
    const styles = {
      success: 'bg-green-100 text-green-700 border-green-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      suspicious: 'bg-orange-100 text-orange-700 border-orange-200',
    };

    return (
      <Badge className={styles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Login')) return <Unlock className="w-4 h-4" />;
    if (action.includes('Viewed') || action.includes('Accessed'))
      return <Eye className="w-4 h-4" />;
    if (action.includes('Downloaded')) return <Download className="w-4 h-4" />;
    if (action.includes('Updated') || action.includes('Created'))
      return <FileText className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesAction = filterAction === 'all' || log.action.includes(filterAction);

    return matchesSearch && matchesStatus && matchesAction;
  });

  const totalActivities = auditLogs.length;
  const suspiciousCount = auditLogs.filter((log) => log.status === 'suspicious').length;
  const failedCount = auditLogs.filter((log) => log.status === 'failed').length;
  const successRate = ((auditLogs.filter((log) => log.status === 'success').length / totalActivities) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Activity Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time audit log and security event tracking
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2 bg-secondary/10 text-secondary border-secondary/20">
          <Activity className="w-4 h-4 mr-2" />
          Live Monitoring
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Activities</p>
            <p className="text-3xl font-semibold">{totalActivities}</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs font-medium text-green-600">{successRate}%</div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
            <p className="text-3xl font-semibold text-green-600">{successRate}%</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              {suspiciousCount > 0 && <TrendingDown className="w-5 h-5 text-orange-500" />}
            </div>
            <p className="text-sm text-orange-700 mb-1">Suspicious</p>
            <p className="text-3xl font-semibold text-orange-700">{suspiciousCount}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              {failedCount > 0 && <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <p className="text-sm text-red-700 mb-1">Failed Attempts</p>
            <p className="text-3xl font-semibold text-red-700">{failedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or resource..."
                className="pl-11 h-12 bg-accent/30 border-border focus:bg-white transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px] h-12">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-[180px] h-12">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Viewed">Viewed</SelectItem>
                <SelectItem value="Updated">Updated</SelectItem>
                <SelectItem value="Created">Created</SelectItem>
                <SelectItem value="Login">Login</SelectItem>
                <SelectItem value="Downloaded">Downloaded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <Card className="border-border shadow-xl">
        <CardHeader className="border-b border-border bg-accent/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activity Log</CardTitle>
            <Badge variant="secondary">{filteredLogs.length} entries</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">User</TableHead>
                  <TableHead className="font-semibold">Action</TableHead>
                  <TableHead className="font-semibold">Resource</TableHead>
                  <TableHead className="font-semibold">Timestamp</TableHead>
                  <TableHead className="font-semibold">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className={`transition-colors ${
                      log.status === 'suspicious'
                        ? 'bg-orange-50/50 hover:bg-orange-50'
                        : log.status === 'failed'
                        ? 'bg-red-50/30 hover:bg-red-50'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {getActionIcon(log.action)}
                        {log.action}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {log.resource}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {log.timestamp}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {log.ipAddress}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
