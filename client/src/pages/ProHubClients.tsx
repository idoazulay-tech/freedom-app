import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Phone, Mail, FileText } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'pending' | 'completed';
  caseCount: number;
  lastContact: string;
}

const mockClients: Client[] = [
  {
    id: 1,
    name: 'דוד כהן',
    phone: '050-1234567',
    email: 'david@example.com',
    status: 'active',
    caseCount: 2,
    lastContact: '2 ימים',
  },
  {
    id: 2,
    name: 'שרה לוי',
    phone: '050-2345678',
    email: 'sarah@example.com',
    status: 'active',
    caseCount: 1,
    lastContact: '5 ימים',
  },
  {
    id: 3,
    name: 'יוסי ברק',
    phone: '050-3456789',
    email: 'yosi@example.com',
    status: 'pending',
    caseCount: 0,
    lastContact: '10 ימים',
  },
];

export default function ProHubClients() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>(
    'all'
  );

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch =
      client.name.includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.email.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'pending':
        return 'בהמתנה';
      case 'completed':
        return 'הושלם';
      default:
        return status;
    }
  };

  return (
    <ProHubLayout currentPage="clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">ניהול לקוחות</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            הוסף לקוח חדש
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
                  placeholder="חפש לקוח לפי שם, טלפון או אימייל..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'active', 'pending', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilterStatus(status as 'all' | 'active' | 'pending' | 'completed')
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

        {/* Clients Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {filteredClients.length} לקוחות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">שם</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">יצירת קשר</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">מקרים</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">סטטוס</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">יצירת קשר אחרונה</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-white font-medium">{client.name}</td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex gap-2">
                          <a
                            href={`tel:${client.phone}`}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`mailto:${client.email}`}
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {client.caseCount}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            client.status
                          )}`}
                        >
                          {getStatusLabel(client.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{client.lastContact}</td>
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
