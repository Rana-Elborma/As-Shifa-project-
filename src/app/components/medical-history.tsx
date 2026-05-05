import { useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  FileText,
  Calendar,
  User,
  Heart,
  Activity,
  Pill,
  FileCheck,
  Lock,
  Filter,
  Search,
  ChevronDown,
  Shield,
} from 'lucide-react';

interface MedicalRecord {
  id: number;
  date: string;
  type: 'checkup' | 'emergency' | 'followup' | 'surgery';
  title: string;
  doctor: {
    name: string;
    specialty: string;
    initials: string;
  };
  diagnosis: string;
  prescription?: string[];
  notes: string;
  vitalSigns?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
  };
}

const records: MedicalRecord[] = [
  {
    id: 1,
    date: '2026-03-15',
    type: 'checkup',
    title: 'Annual Physical Examination',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      initials: 'SJ',
    },
    diagnosis: 'General health checkup - All vital signs normal',
    prescription: ['Multivitamin - Daily', 'Omega-3 - 1000mg daily'],
    notes: 'Patient is in excellent health. Continue current exercise regimen. Schedule follow-up in 6 months.',
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6°F',
    },
  },
  {
    id: 2,
    date: '2026-01-20',
    type: 'followup',
    title: 'Cardiac Follow-up',
    doctor: {
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      initials: 'SJ',
    },
    diagnosis: 'Post-treatment monitoring - Recovery progressing well',
    prescription: ['Beta Blocker - 25mg daily', 'Aspirin - 81mg daily'],
    notes: 'ECG results show improvement. Blood pressure well controlled. Continue current medication.',
    vitalSigns: {
      bloodPressure: '118/78 mmHg',
      heartRate: '68 bpm',
      temperature: '98.4°F',
    },
  },
  {
    id: 3,
    date: '2025-11-05',
    type: 'emergency',
    title: 'Emergency Room Visit',
    doctor: {
      name: 'Dr. Michael Chen',
      specialty: 'Emergency Medicine',
      initials: 'MC',
    },
    diagnosis: 'Acute chest pain - Cardiac event ruled out',
    prescription: ['Pain reliever - As needed', 'Antacid - 20mg twice daily'],
    notes: 'Patient presented with chest discomfort. All cardiac markers normal. Diagnosed with acid reflux.',
    vitalSigns: {
      bloodPressure: '135/85 mmHg',
      heartRate: '88 bpm',
      temperature: '98.9°F',
    },
  },
];

export function MedicalHistory() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter((record) => {
    const matchesType = selectedType === 'all' || record.type === selectedType;
    const matchesSearch =
      searchQuery === '' ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'from-blue-500 to-indigo-500';
      case 'emergency':
        return 'from-red-500 to-pink-500';
      case 'followup':
        return 'from-green-500 to-emerald-500';
      case 'surgery':
        return 'from-purple-500 to-fuchsia-500';
      default:
        return 'from-primary to-secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'checkup':
        return <Activity className="w-5 h-5" />;
      case 'emergency':
        return <Heart className="w-5 h-5" />;
      case 'followup':
        return <FileCheck className="w-5 h-5" />;
      case 'surgery':
        return <Pill className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Patient Info Card */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-2xl shadow-primary/10 p-8 relative">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-purple-500 rounded-3xl blur-2xl opacity-20 -z-10" />

        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24 bg-gradient-to-br from-primary via-blue-500 to-secondary ring-4 ring-white/50 shadow-lg">
            <AvatarFallback className="text-white text-2xl font-semibold">
              JD
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-1">John Doe</h2>
                <p className="text-muted-foreground">Patient ID: #PAT-2024-001</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">Secure Access Enabled</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-2xl p-4">
                <User className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="text-lg font-semibold text-foreground">32 years</p>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 border border-purple-200/50 rounded-2xl p-4">
                <Heart className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Blood Type</p>
                <p className="text-lg font-semibold text-foreground">O+</p>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/80 to-emerald-50/80 border border-green-200/50 rounded-2xl p-4">
                <Activity className="w-5 h-5 text-green-600 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Total Visits</p>
                <p className="text-lg font-semibold text-foreground">{records.length}</p>
              </div>
              <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 border border-orange-200/50 rounded-2xl p-4">
                <Calendar className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Last Visit</p>
                <p className="text-lg font-semibold text-foreground">15 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-xl p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-white/40 bg-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2">
            {['all', 'checkup', 'emergency', 'followup', 'surgery'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-primary to-indigo-500 text-white shadow-lg shadow-primary/30'
                    : 'backdrop-blur-xl bg-white/50 border border-white/40 hover:border-primary/50 text-foreground'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Gradient Timeline Line */}
        <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-transparent" />

        <div className="space-y-6">
          {filteredRecords.map((record, index) => (
            <div key={record.id} className="relative pl-20">
              {/* Timeline Dot */}
              <div className={`absolute left-5 top-8 w-6 h-6 rounded-full bg-gradient-to-r ${getTypeColor(record.type)} shadow-lg flex items-center justify-center ring-4 ring-white/50`}>
                {getTypeIcon(record.type)}
              </div>

              {/* Record Card */}
              <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-3xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] p-6 relative group">
                {/* Glow on Hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${getTypeColor(record.type)} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity -z-10`} />

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{record.title}</h3>
                      <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(record.type)} text-white text-xs font-semibold shadow-lg`}>
                        {record.type}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 bg-gradient-to-br from-primary to-secondary ring-2 ring-white/50">
                      <AvatarFallback className="text-white font-semibold">
                        {record.doctor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{record.doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{record.doctor.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                {record.vitalSigns && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="backdrop-blur-xl bg-gradient-to-br from-red-50/80 to-pink-50/80 border border-red-200/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Blood Pressure</p>
                      <p className="text-sm font-semibold text-foreground">{record.vitalSigns.bloodPressure}</p>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-200/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                      <p className="text-sm font-semibold text-foreground">{record.vitalSigns.heartRate}</p>
                    </div>
                    <div className="backdrop-blur-xl bg-gradient-to-br from-orange-50/80 to-amber-50/80 border border-orange-200/50 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                      <p className="text-sm font-semibold text-foreground">{record.vitalSigns.temperature}</p>
                    </div>
                  </div>
                )}

                {/* Diagnosis */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Diagnosis</p>
                  <p className="text-sm text-muted-foreground">{record.diagnosis}</p>
                </div>

                {/* Prescription */}
                {record.prescription && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Prescription</p>
                    <div className="flex flex-wrap gap-2">
                      {record.prescription.map((med, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-xl bg-gradient-to-r from-purple-50/80 to-fuchsia-50/80 border border-purple-200/50"
                        >
                          <Pill className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-900">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-gray-50/80 to-slate-50/80 border border-gray-200/50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-foreground mb-1">Clinical Notes</p>
                  <p className="text-sm text-muted-foreground">{record.notes}</p>
                </div>

                {/* Action Button */}
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="rounded-xl backdrop-blur-xl bg-white/50 border-2 border-white/40 hover:border-primary/50 hover:bg-white/80 transition-all"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Report
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Records Found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
