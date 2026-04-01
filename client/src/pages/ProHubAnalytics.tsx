import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

export default function ProHubAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const stats = [
    {
      title: 'סך הלקוחות',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'סך החובות',
      value: '₪459,000',
      change: '+₪85,000',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'מקרים סגורים',
      value: '3',
      change: '+1',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'שיעור הצלחה',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  const caseStatusData = [
    { status: 'פתוח', count: 4, percentage: 33 },
    { status: 'בטיפול', count: 6, percentage: 50 },
    { status: 'סגור', count: 2, percentage: 17 },
  ];

  const riskDistribution = [
    { level: 'נמוך', count: 2, percentage: 17 },
    { level: 'בינוני', count: 4, percentage: 33 },
    { level: 'גבוה', count: 4, percentage: 33 },
    { level: 'קריטי', count: 2, percentage: 17 },
  ];

  return (
    <ProHubLayout currentPage="analytics">
      <div className="space-y-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-white">דוחות וניתוחים</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-300">
                      {stat.title}
                    </CardTitle>
                    <Icon className="w-4 h-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-sm text-green-400 mt-2">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Status Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                התפלגות מקרים לפי סטטוס
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseStatusData.map((item) => (
                  <div key={item.status}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">{item.status}</span>
                      <span className="text-white font-medium">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                התפלגות רמות סיכון
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskDistribution.map((item) => {
                  let color = 'bg-green-600';
                  if (item.level === 'בינוני') color = 'bg-yellow-600';
                  if (item.level === 'גבוה') color = 'bg-orange-600';
                  if (item.level === 'קריטי') color = 'bg-red-600';

                  return (
                    <div key={item.level}>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-300">{item.level}</span>
                        <span className="text-white font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className={`${color} h-2 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Performance */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">ביצועים חודשיים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">לקוחות חדשים</p>
                <p className="text-3xl font-bold text-white">3</p>
                <p className="text-green-400 text-sm mt-2">+50% מהחודש הקודם</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">מקרים סגורים</p>
                <p className="text-3xl font-bold text-white">2</p>
                <p className="text-green-400 text-sm mt-2">+100% מהחודש הקודם</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">סכום שהוחזר</p>
                <p className="text-3xl font-bold text-white">₪45,000</p>
                <p className="text-green-400 text-sm mt-2">+25% מהחודש הקודם</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProHubLayout>
  );
}
