import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Case {
  id: number;
  caseNumber: string;
  clientName: string;
  debtAmount: number;
  status: 'open' | 'in_progress' | 'closed';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  createdDate: string;
  lastUpdate: string;
}

const mockCases: Case[] = [
  {
    id: 1,
    caseNumber: 'CASE-2024-001',
    clientName: 'דוד כהן',
    debtAmount: 124000,
    status: 'in_progress',
    riskLevel: 'high',
    createdDate: '2024-01-15',
    lastUpdate: '2024-04-01',
  },
  {
    id: 2,
    caseNumber: 'CASE-2024-002',
    clientName: 'שרה לוי',
    debtAmount: 85000,
    status: 'open',
    riskLevel: 'medium',
    createdDate: '2024-02-20',
    lastUpdate: '2024-03-28',
  },
  {
    id: 3,
    caseNumber: 'CASE-2024-003',
    clientName: 'יוסי ברק',
    debtAmount: 250000,
    status: 'in_progress',
    riskLevel: 'critical',
    createdDate: '2024-03-10',
    lastUpdate: '2024-04-01',
  },
];

export default function ProHubCases() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'closed'>(
    'all'
  );

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const filteredCases = mockCases.filter((caseItem) => {
    const matchesSearch =
      caseItem.caseNumber.includes(searchTerm) ||
      caseItem.clientName.includes(searchTerm) ||
      caseItem.debtAmount.toString().includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || caseItem.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'נמוך';
      case 'medium':
        return 'בינוני';
      case 'high':
        return 'גבוה';
      case 'critical':
        return 'קריטי';
      default:
        return risk;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'פתוח';
      case 'in_progress':
        return 'בטיפול';
      case 'closed':
        return 'סגור';
      default:
        return status;
    }
  };

  return (
    <ProHubLayout currentPage="cases">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">ניהול מקרים</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            צור מקרה חדש
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="חפש מקרה לפי מספר, לקוח או סכום..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'open', 'in_progress', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilterStatus(status as 'all' | 'open' | 'in_progress' | 'closed')
                    }
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status === 'all' ? 'הכל' : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {filteredCases.length} מקרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">מספר מקרה</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">לקוח</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">סכום חוב</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">רמת סיכון</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">סטטוס</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">עדכון אחרון</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-white font-medium">{caseItem.caseNumber}</td>
                      <td className="px-4 py-3 text-slate-300">{caseItem.clientName}</td>
                      <td className="px-4 py-3 text-slate-300">
                        ₪{caseItem.debtAmount.toLocaleString('he-IL')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                            caseItem.riskLevel
                          )}`}
                        >
                          {getRiskLabel(caseItem.riskLevel)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-300">
                          {getStatusIcon(caseItem.status)}
                          {getStatusLabel(caseItem.status)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{caseItem.lastUpdate}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:text-blue-300 text-sm">
                          צפה בפרטים
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProHubLayout>
  );
}
