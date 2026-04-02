import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import {
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  ChevronRight,
} from 'lucide-react';

interface DiagnosisData {
  id: number;
  totalRiskScore: number;
  riskLevel: string;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableForDebt: number;
  creditorCount: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  debts: any[];
  actions: any[];
  createdAt: Date;
}

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [diagnosis, setDiagnosis] = useState<DiagnosisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch diagnosis data
  const { data: diagnosisData, isLoading: isDiagnosisLoading } = trpc.diagnosis.getMine.useQuery();

  useEffect(() => {
    if (!isDiagnosisLoading && diagnosisData) {
      setDiagnosis(diagnosisData as DiagnosisData);
    }
    setIsLoading(isDiagnosisLoading);
  }, [diagnosisData, isDiagnosisLoading]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'נמוך':
        return 'text-green-600 bg-green-50';
      case 'בינוני':
        return 'text-yellow-600 bg-yellow-50';
      case 'גבוה':
        return 'text-orange-600 bg-orange-50';
      case 'קריטי':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'נמוך':
        return <CheckCircle className="w-5 h-5" />;
      case 'בינוני':
        return <AlertCircle className="w-5 h-5" />;
      case 'גבוה':
        return <AlertCircle className="w-5 h-5" />;
      case 'קריטי':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">טוען...</div>
      </DashboardLayout>
    );
  }

  if (!diagnosis) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">פרופיל</h1>
            <p className="text-gray-600">פרטי החשבון שלך</p>
          </div>

          <Card className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">עדיין לא בצעת אבחון</h3>
              <p className="text-gray-600 mb-6">בואו נתחיל בהזנת נתונים כדי לקבל תוכנית פעולה</p>
              <Button onClick={() => setLocation('/debt-form')}>
                התחל אבחון
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">פרופיל</h1>
          <p className="text-gray-600">פרטי החשבון שלך והאבחון האחרון</p>
        </div>

        {/* User Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">פרטי המשתמש</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">שם</p>
              <p className="text-lg font-semibold">{user?.name || 'לא זמין'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">אימייל</p>
              <p className="text-lg font-semibold">{user?.email || 'לא זמין'}</p>
            </div>
          </div>
        </Card>

        {/* Diagnosis Summary */}
        <Card className={`p-6 border-2 ${getRiskLevelColor(diagnosis.riskLevel)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {getRiskLevelIcon(diagnosis.riskLevel)}
              <div>
                <h2 className="text-2xl font-bold">רמת סיכון: {diagnosis.riskLevel}</h2>
                <p className="text-sm mt-2">ניקוד סיכון: {diagnosis.totalRiskScore}/200</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {Math.round((diagnosis.totalRiskScore / 200) * 100)}%
              </div>
              <p className="text-sm text-gray-600">מדד סיכון</p>
            </div>
          </div>
        </Card>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">סה"כ חובות</p>
                <p className="text-2xl font-bold">₪{diagnosis.totalDebt.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">הכנסה חודשית</p>
                <p className="text-2xl font-bold">₪{diagnosis.monthlyIncome.toLocaleString()}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">זמין לתשלום</p>
                <p className={`text-2xl font-bold ${diagnosis.availableForDebt >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₪{diagnosis.availableForDebt.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Detailed Information */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">מידע מפורט</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">הוצאות חודשיות</p>
                <p className="text-xl font-bold">₪{diagnosis.monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">מספר נושים</p>
                <p className="text-xl font-bold">{diagnosis.creditorCount}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">יחס חוב להכנסה</p>
                <p className="text-xl font-bold">
                  {diagnosis.monthlyIncome > 0
                    ? ((diagnosis.totalDebt / (diagnosis.monthlyIncome * 12)).toFixed(1))
                    : '0'}
                  x
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600">סטטוס משפטי</p>
                <div className="flex gap-2 mt-2">
                  {diagnosis.hasEnforcement && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">הוצאה לפועל</span>
                  )}
                  {diagnosis.hasWarningLetters && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">הודעות משפטיות</span>
                  )}
                  {!diagnosis.hasEnforcement && !diagnosis.hasWarningLetters && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ללא הליכים משפטיים</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Debts List */}
        {diagnosis.debts && diagnosis.debts.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              החובות שלך
            </h2>
            <div className="space-y-3">
              {diagnosis.debts.map((debt, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold">{debt.category}</h4>
                      <p className="text-sm text-gray-600">
                        {debt.monthsLate} חודשים בפיגור • סטטוס: {debt.legalStatus}
                      </p>
                    </div>
                    <span className="text-lg font-bold">₪{debt.amount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Actions */}
        {diagnosis.actions && diagnosis.actions.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              משימות אוטומטיות
            </h2>
            <div className="space-y-3">
              {diagnosis.actions.map((action, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" className="mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      <span
                        className={`text-xs mt-2 inline-block px-2 py-1 rounded ${
                          action.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : action.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {action.priority === 'high' ? 'דחוף' : action.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Last Updated */}
        <Card className="p-6 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              אבחון אחרון:{' '}
              {new Date(diagnosis.createdAt).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => setLocation('/dashboard')} variant="outline">
            חזור לדשבורד
          </Button>
          <Button onClick={() => setLocation('/debt-form')}>
            בצע אבחון חדש
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
