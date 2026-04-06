import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { AlertCircle, CheckCircle, Clock, Users, TrendingDown, FileText } from 'lucide-react';

interface Debt {
  category: string;
  amount: number;
  riskScore: number;
}

interface DiagnosisData {
  id: number;
  userId: string;
  totalRiskScore: number;
  riskLevel: string;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  creditorCount: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  debtsData: string;
  actionsData: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Profile() {
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: diagnosisData } = trpc.diagnosis.getMine.useQuery();

  useEffect(() => {
    if (diagnosisData) {
      setDiagnosis(diagnosisData);
      try {
        const parsedDebts = JSON.parse(diagnosisData.debtsData || '[]');
        setDebts(parsedDebts);
      } catch {
        setDebts([]);
      }
      try {
        const parsedActions = JSON.parse(diagnosisData.actionsData || '[]');
        setActions(parsedActions);
      } catch {
        setActions([]);
      }
      setIsLoading(false);
    }
  }, [diagnosisData]);

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-700 border-slate-500/30';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <Clock className="w-5 h-5" />;
      case 'low':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">הפרופיל שלי</h1>
            <p className="text-slate-400">טוען נתונים...</p>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8">
              <p className="text-slate-300 text-center">טוען את נתוני האבחון...</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!diagnosis) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">הפרופיל שלי</h1>
            <p className="text-slate-400">עדיין לא בוצע אבחון</p>
          </div>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center space-y-4">
              <p className="text-slate-300">עדיין לא ביצעת אבחון מקצועי.</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                התחל אבחון עכשיו
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">הפרופיל שלי</h1>
          <p className="text-slate-400">סיכום מצב החוב והמלצות אישיות</p>
        </div>

        {/* Risk Level Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getRiskIcon(diagnosis.riskLevel)}
              רמת הסיכון שלך
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">ניקוד סיכון:</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{diagnosis.totalRiskScore}</span>
                <span className="text-slate-400">/200</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full"
                style={{ width: `${(diagnosis.totalRiskScore / 200) * 100}%` }}
              />
            </div>
            <Badge className={`${getRiskColor(diagnosis.riskLevel)} border`}>
              {diagnosis.riskLevel === 'critical' && 'סיכון קריטי - דחוף!'}
              {diagnosis.riskLevel === 'high' && 'סיכון גבוה - דרוש פעולה'}
              {diagnosis.riskLevel === 'medium' && 'סיכון בינוני - יש זמן'}
              {diagnosis.riskLevel === 'low' && 'סיכון נמוך - יציב'}
            </Badge>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                סיכום כלכלי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">סך החוב:</span>
                <span className="text-white font-bold">₪{diagnosis.totalDebt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">הכנסה חודשית:</span>
                <span className="text-white font-bold">₪{diagnosis.monthlyIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">הוצאות חודשיות:</span>
                <span className="text-white font-bold">₪{diagnosis.monthlyExpenses.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="text-slate-300">זמין לחוב:</span>
                <span className={`font-bold ${diagnosis.availableForDebt > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₪{diagnosis.availableForDebt.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                מצב משפטי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">מספר נושים:</span>
                <span className="text-white font-bold">{diagnosis.creditorCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">הליכי הוצאה לפועל:</span>
                <Badge className={diagnosis.hasEnforcement ? 'bg-red-500/20 text-red-700 border border-red-500/30' : 'bg-green-500/20 text-green-700 border border-green-500/30'}>
                  {diagnosis.hasEnforcement ? 'כן - דחוף!' : 'לא'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">מכתבי התראה:</span>
                <Badge className={diagnosis.hasWarningLetters ? 'bg-orange-500/20 text-orange-700 border border-orange-500/30' : 'bg-green-500/20 text-green-700 border border-green-500/30'}>
                  {diagnosis.hasWarningLetters ? 'כן' : 'לא'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debts List */}
        {debts.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                רשימת החובות ({debts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debts.map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="flex-1">
                      <p className="text-white font-medium">{debt.category}</p>
                      <p className="text-slate-400 text-sm">ניקוד סיכון: {debt.riskScore}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">₪{debt.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Actions */}
        {actions.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                פעולות מומלצות
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-200">{action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button className="bg-blue-600 hover:bg-blue-700">
            עדכן אבחון
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            הורד דוח
          </Button>
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            בקש ייעוץ
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-center text-slate-400 text-sm">
          <p>אבחון אחרון: {new Date(diagnosis.updatedAt).toLocaleDateString('he-IL')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
