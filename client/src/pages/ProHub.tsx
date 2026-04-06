import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, MessageSquare, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  totalDebt: number;
  status: 'active' | 'completed' | 'paused';
  joinedDate: Date;
  lastContact: Date;
  rating: number;
  tasksCompleted: number;
  tasksTotal: number;
}

interface CaseStats {
  totalClients: number;
  activeClients: number;
  completedCases: number;
  averageRating: number;
  totalDebtManaged: number;
  successRate: number;
}

export default function ProHub() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'דוד כהן',
      riskLevel: 'critical',
      totalDebt: 150000,
      status: 'active',
      joinedDate: new Date('2026-01-15'),
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rating: 4.5,
      tasksCompleted: 3,
      tasksTotal: 8,
    },
    {
      id: 2,
      name: 'שרה לוי',
      riskLevel: 'high',
      totalDebt: 85000,
      status: 'active',
      joinedDate: new Date('2026-02-01'),
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rating: 5,
      tasksCompleted: 5,
      tasksTotal: 6,
    },
    {
      id: 3,
      name: 'יוסי רוזנברג',
      riskLevel: 'medium',
      totalDebt: 45000,
      status: 'completed',
      joinedDate: new Date('2025-12-20'),
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rating: 4.8,
      tasksCompleted: 10,
      tasksTotal: 10,
    },
  ]);

  const stats: CaseStats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === 'active').length,
    completedCases: clients.filter((c) => c.status === 'completed').length,
    averageRating: parseFloat((clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1)),
    totalDebtManaged: clients.reduce((sum, c) => sum + c.totalDebt, 0),
    successRate: Math.round(
      (clients.filter((c) => c.status === 'completed').length / clients.length) * 100
    ),
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'paused':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical':
        return 'קריטי';
      case 'high':
        return 'גבוה';
      case 'medium':
        return 'בינוני';
      case 'low':
        return 'נמוך';
      default:
        return 'לא ידוע';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'פעיל';
      case 'completed':
        return 'הושלם';
      case 'paused':
        return 'מושהה';
      default:
        return 'לא ידוע';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Pro Hub</h1>
          <p className="text-slate-300">ניהול לקוחות ומקרים</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">סה"כ לקוחות</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">פעילים</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.activeClients}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">הושלמו</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completedCases}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">דירוג ממוצע</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.averageRating.toFixed(1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">שיעור הצלחה</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">חוב מנוהל</p>
                  <p className="text-xl font-bold text-white">
                    ₪{(stats.totalDebtManaged / 1000).toFixed(0)}K
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients List */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                הלקוחות שלי
              </CardTitle>
              <Button className="bg-blue-600 hover:bg-blue-700">+ הוסף לקוח</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{client.name}</h3>
                      <Badge className={`${getRiskColor(client.riskLevel)} text-xs`}>
                        {getRiskLabel(client.riskLevel)}
                      </Badge>
                      <Badge className={`${getStatusColor(client.status)} text-xs`}>
                        {getStatusLabel(client.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-300">
                      <span>💰 ₪{client.totalDebt.toLocaleString('he-IL')}</span>
                      <span>⭐ {client.rating}/5</span>
                      <span>✅ {client.tasksCompleted}/{client.tasksTotal} משימות</span>
                      <span>📅 {client.lastContact.toLocaleDateString('he-IL')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-600"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      צפה בפרטים
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">פעולות מהירות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start bg-slate-700 hover:bg-slate-600">
                📧 שלח עדכון לכל הלקוחות
              </Button>
              <Button className="w-full justify-start bg-slate-700 hover:bg-slate-600">
                📊 צפה בדוחות
              </Button>
              <Button className="w-full justify-start bg-slate-700 hover:bg-slate-600">
                ⚙️ הגדרות Pro Hub
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">הודעות חשובות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-sm">
                🔴 דוד כהן: תזכורת - משימה דחופה בעוד 2 ימים
              </div>
              <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded text-orange-300 text-sm">
                🟠 שרה לוי: בקשה חדשה לעדכון תוכנית פירעון
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-green-300 text-sm">
                🟢 יוסי רוזנברג: מקרה הושלם בהצלחה!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
