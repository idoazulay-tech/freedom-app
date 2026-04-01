import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentPlan {
  id: number;
  creditor: string;
  totalDebt: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed';
  paidMonths: number;
  totalMonths: number;
  nextPaymentDate: string;
}

const mockPlans: PaymentPlan[] = [
  {
    id: 1,
    creditor: 'כאל',
    totalDebt: 45000,
    monthlyPayment: 1500,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    paidMonths: 3,
    totalMonths: 30,
    nextPaymentDate: '2024-04-05',
  },
  {
    id: 2,
    creditor: 'הפניקס',
    totalDebt: 35000,
    monthlyPayment: 2000,
    startDate: '2024-02-01',
    endDate: '2025-06-30',
    status: 'active',
    paidMonths: 2,
    totalMonths: 29,
    nextPaymentDate: '2024-04-10',
  },
  {
    id: 3,
    creditor: 'ישראכרט',
    totalDebt: 44000,
    monthlyPayment: 1800,
    startDate: '2024-03-01',
    endDate: '2025-12-31',
    status: 'pending',
    paidMonths: 0,
    totalMonths: 24,
    nextPaymentDate: '2024-04-01',
  },
];

export default function PaymentPlans() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(mockPlans[0]);

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'הושלם';
      case 'active':
        return 'פעיל';
      case 'pending':
        return 'בהמתנה';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'active':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const totalMonthlyPayment = mockPlans.reduce((sum, plan) => sum + plan.monthlyPayment, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur mb-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white ltr" dir="ltr">🔓 Freedom</div>
          <button
            onClick={() => setLocation('/personal-profile')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← חזור לפרופיל
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">תשלום חודשי כולל</p>
                  <p className="text-2xl font-bold text-white">₪{totalMonthlyPayment.toLocaleString('he-IL')}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">סדרים פעילים</p>
                  <p className="text-2xl font-bold text-white">{mockPlans.filter(p => p.status === 'active').length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">סדרים הושלמו</p>
                  <p className="text-2xl font-bold text-white">{mockPlans.filter(p => p.status === 'completed').length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plans List */}
          <div className="lg:col-span-1 space-y-3">
            {mockPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full text-right p-4 rounded-lg transition-colors border ${
                  selectedPlan?.id === plan.id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{plan.creditor}</span>
                  {getStatusIcon(plan.status)}
                </div>
                <div className="text-sm text-slate-300">
                  ₪{plan.monthlyPayment.toLocaleString('he-IL')}/חודש
                </div>
              </button>
            ))}
          </div>

          {/* Plan Details */}
          {selectedPlan && (
            <div className="lg:col-span-2 space-y-4">
              {/* Main Details */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-2xl">{selectedPlan.creditor}</CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedPlan.status
                      )}`}
                    >
                      {getStatusLabel(selectedPlan.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">סך החוב</p>
                      <p className="text-white font-bold">₪{selectedPlan.totalDebt.toLocaleString('he-IL')}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">תשלום חודשי</p>
                      <p className="text-white font-bold">₪{selectedPlan.monthlyPayment.toLocaleString('he-IL')}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">תאריך התחלה</p>
                      <p className="text-white font-bold">{selectedPlan.startDate}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">תאריך סיום</p>
                      <p className="text-white font-bold">{selectedPlan.endDate}</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">התקדמות</span>
                      <span className="text-white font-bold">
                        {selectedPlan.paidMonths}/{selectedPlan.totalMonths} חודשים
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${(selectedPlan.paidMonths / selectedPlan.totalMonths) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Payment */}
                  <div className="bg-blue-900/20 border border-blue-600 p-3 rounded-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 text-sm">תשלום הבא</p>
                      <p className="text-white font-bold">{selectedPlan.nextPaymentDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  רשום תשלום
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  שנה סדר
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Schedule */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">לוח תשלומים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">נושה</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">תשלום חודשי</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">תאריך הבא</th>
                    <th className="px-4 py-3 text-right text-slate-400 font-medium">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-white">{plan.creditor}</td>
                      <td className="px-4 py-3 text-slate-300">₪{plan.monthlyPayment.toLocaleString('he-IL')}</td>
                      <td className="px-4 py-3 text-slate-300">{plan.nextPaymentDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            plan.status
                          )}`}
                        >
                          {getStatusLabel(plan.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
