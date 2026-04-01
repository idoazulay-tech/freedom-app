import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CheckSquare, TrendingUp } from 'lucide-react';

export default function ProHub() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const stats = [
    {
      title: 'לקוחות פעילים',
      value: '12',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'מקרים בטיפול',
      value: '8',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'משימות פתוחות',
      value: '15',
      icon: CheckSquare,
      color: 'bg-green-500',
    },
    {
      title: 'הצלחה בחודש',
      value: '85%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  return (
    <ProHubLayout currentPage="dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">לקוחות אחרונים</CardTitle>
            <CardDescription>לקוחות שנוספו בשבועות האחרונים</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-white">לקוח {i}</p>
                    <p className="text-sm text-slate-400">מקרה בטיפול</p>
                  </div>
                  <div className="text-sm text-slate-400">לפני {i} ימים</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">פעולות מהירות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                הוסף לקוח חדש
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                צור מקרה חדש
              </button>
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                הוסף משימה
              </button>
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                צפה בדוחות
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProHubLayout>
  );
}
