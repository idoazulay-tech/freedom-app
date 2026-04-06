import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, DollarSign, TrendingDown, Clock } from 'lucide-react';

interface PaymentPlanData {
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  riskLevel: string;
  hasEnforcement: boolean;
}

export default function PaymentPlanSection({ diagnosis }: { diagnosis: PaymentPlanData }) {
  const paymentPlan = useMemo(() => {
    const availableForDebt = Math.max(0, diagnosis.monthlyIncome - diagnosis.monthlyExpenses);

    // Calculate payment based on risk level
    let monthlyPayment = 0;
    let interestRate = 0;

    switch (diagnosis.riskLevel?.toLowerCase()) {
      case 'critical':
        monthlyPayment = Math.max(availableForDebt * 0.6, diagnosis.totalDebt / 60);
        interestRate = 0.12;
        break;
      case 'high':
        monthlyPayment = Math.max(availableForDebt * 0.5, diagnosis.totalDebt / 48);
        interestRate = 0.09;
        break;
      case 'medium':
        monthlyPayment = Math.max(availableForDebt * 0.4, diagnosis.totalDebt / 36);
        interestRate = 0.06;
        break;
      case 'low':
        monthlyPayment = Math.max(availableForDebt * 0.3, diagnosis.totalDebt / 24);
        interestRate = 0.03;
        break;
      default:
        monthlyPayment = availableForDebt * 0.4;
        interestRate = 0.06;
    }

    if (diagnosis.hasEnforcement) {
      monthlyPayment *= 1.2;
    }

    monthlyPayment = Math.max(monthlyPayment, diagnosis.totalDebt / 120);

    // Calculate schedule for chart
    let remainingBalance = diagnosis.totalDebt;
    let totalInterest = 0;
    const payments = [];
    let month = 0;

    while (remainingBalance > 0 && month < 360) {
      month++;
      const monthlyInterest = (remainingBalance * interestRate) / 12;
      const principal = Math.min(monthlyPayment - monthlyInterest, remainingBalance);

      remainingBalance = Math.max(0, remainingBalance - principal);
      totalInterest += monthlyInterest;

      if (month <= 60) {
        // Only store first 60 months for chart
        payments.push({
          month,
          payment: Math.round(monthlyPayment),
          balance: Math.round(remainingBalance),
          interest: Math.round(monthlyInterest),
        });
      }
    }

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalMonths: month,
      yearsToPayOff: Math.ceil(month / 12),
      totalInterest: Math.round(totalInterest * 100) / 100,
      payments,
    };
  }, [diagnosis]);

  const getYearsColor = (years: number) => {
    if (years <= 2) return 'text-green-400';
    if (years <= 5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">תשלום חודשי</p>
                <p className="text-2xl font-bold text-white">₪{paymentPlan.monthlyPayment.toLocaleString('he-IL')}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">זמן פירעון</p>
                <p className={`text-2xl font-bold ${getYearsColor(paymentPlan.yearsToPayOff)}`}>
                  {paymentPlan.yearsToPayOff} שנים
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">ריבית כוללת</p>
                <p className="text-2xl font-bold text-orange-400">₪{paymentPlan.totalInterest.toLocaleString('he-IL')}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">סה"כ תשלומים</p>
                <p className="text-2xl font-bold text-white">{paymentPlan.totalMonths}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Reduction Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">התקדמות פירעון החוב</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentPlan.payments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: any) => `₪${value.toLocaleString('he-IL')}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#ef4444"
                name="יתרת חוב"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Payment Chart */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">התפלגות תשלומים חודשיים</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paymentPlan.payments.slice(0, 24)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: any) => `₪${value.toLocaleString('he-IL')}`}
              />
              <Legend />
              <Bar dataKey="payment" fill="#3b82f6" name="תשלום כולל" />
              <Bar dataKey="interest" fill="#f97316" name="ריבית" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">6 התשלומים הקרובים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentPlan.payments.slice(0, 6).map((payment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    חודש {payment.month}
                  </Badge>
                  <div>
                    <p className="text-white font-semibold">₪{payment.payment.toLocaleString('he-IL')}</p>
                    <p className="text-slate-400 text-sm">יתרה: ₪{payment.balance.toLocaleString('he-IL')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">ריבית: ₪{payment.interest.toLocaleString('he-IL')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Strategy */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">אסטרטגיית פירעון</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 font-semibold mb-1">💡 המלצה:</p>
            <p className="text-blue-200 text-sm">
              {paymentPlan.yearsToPayOff <= 2
                ? 'תוכנית פירעון אגרסיבית - אתה יכול להיפטר מהחוב בתוך שנתיים!'
                : paymentPlan.yearsToPayOff <= 5
                  ? 'תוכנית פירעון סבירה - פירעון בתוך 5 שנים עם ריביות נמוכות יחסית'
                  : 'תוכנית פירעון ארוכת טווח - שקול להגביר את התשלומים החודשיים כדי להקטין את הריביות'}
            </p>
          </div>

          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-300 font-semibold mb-1">✓ מה אתה יכול לעשות:</p>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• הגבר את ההכנסה החודשית כדי להגביר את התשלומים</li>
              <li>• הקטן את ההוצאות החודשיות כדי להגביר את הזמין לחוב</li>
              <li>• בקש הנחה מהנושים בגלל תוכנית פירעון מובנית</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
