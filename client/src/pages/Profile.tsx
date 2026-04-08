import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { AlertCircle, CheckCircle, Clock, Users, TrendingDown, FileText } from 'lucide-react';
import PaymentPlanSection from '@/components/PaymentPlanSection';
import ProfessionalsSection from '@/components/ProfessionalsSection';
import AdvancedScoringSection from '@/components/AdvancedScoringSection';
import TasksSection from '@/components/TasksSection';
import DocumentsSection from '@/components/DocumentsSection';
import NotificationsCenter from '@/components/NotificationsCenter';

interface Debt {
  category: string;
  amount: number;
  riskScore: number;
}

interface DiagnosisData {
  id: number;
  userId: number | string;
  totalRiskScore: number;
  riskLevel: string;
  totalDebt: number;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  availableForDebt: number | null;
  creditorCount: number | null;
  hasEnforcement: boolean | null;
  hasWarningLetters: boolean | null;
  debtsData: string;
  actionsData: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export default function Profile() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  const { data: diagnosis, isLoading } = trpc.diagnosis.getMine.useQuery();

  useEffect(() => {
    if (diagnosis) {
      try {
        const parsedDebts = JSON.parse(diagnosis.debtsData || '[]');
        setDebts(parsedDebts);
      } catch {
        setDebts([]);
      }
      try {
        const parsedActions = JSON.parse(diagnosis.actionsData || '[]');
        setActions(parsedActions);
      } catch {
        setActions([]);
      }
    }
  }, [diagnosis]);

  // Map new persona labels to old risk level names for compatibility
  const mapPersonaToRiskLevel = (persona: string): string => {
    const normalized = persona?.toLowerCase();
    if (normalized === 'yossi') return 'critical';
    if (normalized === 'dana') return 'high';
    if (normalized === 'avi') return 'medium';
    if (normalized === 'green') return 'low';
    return normalized || 'medium';
  };

  const getRiskColor = (level: string) => {
    const normalized = mapPersonaToRiskLevel(level);
    switch (normalized) {
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
    const normalized = mapPersonaToRiskLevel(level);
    switch (normalized) {
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

  const getRiskDescription = (level: string): string => {
    const normalized = level?.toLowerCase();
    if (normalized === 'yossi') return 'סיכון קריטי - דחוף!';
    if (normalized === 'dana') return 'סיכון גבוה - דרוש פעולה';
    if (normalized === 'avi') return 'סיכון בינוני - יש זמן';
    if (normalized === 'green') return 'סיכון נמוך - יציב';
    
    // Fallback for old format
    switch (normalized) {
      case 'critical': return 'סיכון קריטי - דחוף!';
      case 'high': return 'סיכון גבוה - דרוש פעולה';
      case 'medium': return 'סיכון בינוני - יש זמן';
      case 'low': return 'סיכון נמוך - יציב';
      default: return 'סיכון לא ידוע';
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
                <span className="text-slate-400">/400</span>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full"
                style={{ width: `${(diagnosis.totalRiskScore / 400) * 100}%` }}
              />
            </div>
            <Badge className={`${getRiskColor(diagnosis.riskLevel)} border`}>
              {getRiskDescription(diagnosis.riskLevel)}
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
                <span className="text-white font-bold">₪{(diagnosis.monthlyIncome || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">הוצאות חודשיות:</span>
                <span className="text-white font-bold">₪{(diagnosis.monthlyExpenses || 0).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-700 pt-3 flex justify-between">
                <span className="text-slate-300">זמין לחוב:</span>
                <span className={`font-bold ${(diagnosis.availableForDebt || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₪{((diagnosis.availableForDebt || 0)).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                סיכום משפטי
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">מספר נושים:</span>
                <span className="text-white font-bold">{diagnosis.creditorCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">הוצל"פ פעיל:</span>
                <span className={diagnosis.hasEnforcement ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {diagnosis.hasEnforcement ? 'כן' : 'לא'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">מכתבי התראה:</span>
                <span className={diagnosis.hasWarningLetters ? 'text-orange-400 font-bold' : 'text-green-400 font-bold'}>
                  {diagnosis.hasWarningLetters ? 'כן' : 'לא'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debts List */}
        {debts.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                החובות שלך ({debts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debts.map((debt, idx) => (
                  <div key={idx} className="bg-slate-700/50 p-3 rounded flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{debt.category}</p>
                      <p className="text-slate-400 text-sm">סיכון: {debt.riskScore}/100</p>
                    </div>
                    <span className="text-white font-bold">₪{debt.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        <PaymentPlanSection diagnosis={{
          totalDebt: diagnosis.totalDebt,
          monthlyIncome: diagnosis.monthlyIncome || 0,
          monthlyExpenses: diagnosis.monthlyExpenses || 0,
          availableForDebt: diagnosis.availableForDebt || 0,
          riskLevel: diagnosis.riskLevel,
          hasEnforcement: diagnosis.hasEnforcement || false,
        }} />
        <AdvancedScoringSection diagnosis={diagnosis} />
        <ProfessionalsSection />
        <TasksSection diagnosis={diagnosis} />
        <DocumentsSection />
        <NotificationsCenter />

        {/* Last Updated */}
        <div className="text-center text-slate-400 text-sm">
          עדכון אחרון: {new Date(diagnosis.updatedAt || diagnosis.createdAt).toLocaleDateString('he-IL')}
        </div>
      </div>
    </DashboardLayout>
  );
}
