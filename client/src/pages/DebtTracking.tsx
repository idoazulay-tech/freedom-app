import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Debt {
  id: number;
  creditor: string;
  amount: number;
  originalAmount: number;
  status: 'active' | 'negotiating' | 'settled';
  dueDate: string;
  monthlyPayment: number;
  progress: number;
}

const mockDebts: Debt[] = [
  {
    id: 1,
    creditor: 'כאל',
    amount: 45000,
    originalAmount: 50000,
    status: 'negotiating',
    dueDate: '2024-12-31',
    monthlyPayment: 1500,
    progress: 10,
  },
  {
    id: 2,
    creditor: 'הפניקס',
    amount: 35000,
    originalAmount: 40000,
    status: 'active',
    dueDate: '2025-06-30',
    monthlyPayment: 2000,
    progress: 12,
  },
  {
    id: 3,
    creditor: 'ישראכרט',
    amount: 44000,
    originalAmount: 44000,
    status: 'active',
    dueDate: '2025-12-31',
    monthlyPayment: 1800,
    progress: 0,
  },
];

export default function DebtTracking() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(mockDebts[0]);

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const totalDebt = mockDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = mockDebts.reduce((sum, debt) => sum + (debt.originalAmount - debt.amount), 0);
  const totalProgress = (totalPaid / mockDebts.reduce((sum, debt) => sum + debt.originalAmount, 0)) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled':
        return 'bg-green-100 text-green-800';
      case 'negotiating':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'settled':
        return 'סגור';
      case 'negotiating':
        return 'בהסכם';
      case 'active':
        return 'פעיל';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settled':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'negotiating':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'active':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

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
        {/* Overall Progress */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              התקדמות כללית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">סך החוב המקורי</span>
                  <span className="text-white font-bold">₪{mockDebts.reduce((sum, d) => sum + d.originalAmount, 0).toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">סך החוב הנוכחי</span>
                  <span className="text-white font-bold">₪{totalDebt.toLocaleString('he-IL')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">סכום ששולם</span>
                  <span className="text-green-400 font-bold">₪{totalPaid.toLocaleString('he-IL')}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-300">התקדמות</span>
                  <span className="text-white font-bold">{totalProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Debts List */}
          <div className="lg:col-span-1 space-y-3">
            {mockDebts.map((debt) => (
              <button
                key={debt.id}
                onClick={() => setSelectedDebt(debt)}
                className={`w-full text-right p-4 rounded-lg transition-colors border ${
                  selectedDebt?.id === debt.id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{debt.creditor}</span>
                  {getStatusIcon(debt.status)}
                </div>
                <div className="text-sm text-slate-300">
                  ₪{debt.amount.toLocaleString('he-IL')}
                </div>
              </button>
            ))}
          </div>

          {/* Debt Details */}
          {selectedDebt && (
            <div className="lg:col-span-2 space-y-4">
              {/* Main Details */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-2xl">{selectedDebt.creditor}</CardTitle>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedDebt.status
                      )}`}
                    >
                      {getStatusLabel(selectedDebt.status)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">סכום מקורי</p>
                      <p className="text-white font-bold">₪{selectedDebt.originalAmount.toLocaleString('he-IL')}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">סכום נוכחי</p>
                      <p className="text-white font-bold">₪{selectedDebt.amount.toLocaleString('he-IL')}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">תשלום חודשי</p>
                      <p className="text-white font-bold">₪{selectedDebt.monthlyPayment.toLocaleString('he-IL')}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">תאריך יעד</p>
                      <p className="text-white font-bold">{selectedDebt.dueDate}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">התקדמות</span>
                      <span className="text-white font-bold">{selectedDebt.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                        style={{ width: `${selectedDebt.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-green-900/20 border border-green-600 p-3 rounded-lg">
                    <p className="text-green-400 text-sm">
                      ✓ חסכת ₪{(selectedDebt.originalAmount - selectedDebt.amount).toLocaleString('he-IL')} ({Math.round(((selectedDebt.originalAmount - selectedDebt.amount) / selectedDebt.originalAmount) * 100)}%)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  עדכן תשלום
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                  צור קשר עם נושה
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">היסטוריית תשלומים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { date: '01/04/2024', amount: 1500, creditor: 'כאל' },
                { date: '15/03/2024', amount: 2000, creditor: 'הפניקס' },
                { date: '01/03/2024', amount: 1800, creditor: 'ישראכרט' },
              ].map((payment, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{payment.creditor}</p>
                    <p className="text-sm text-slate-400">{payment.date}</p>
                  </div>
                  <p className="text-green-400 font-bold">+₪{payment.amount.toLocaleString('he-IL')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
