import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckSquare, Users, TrendingDown, AlertCircle, ChevronRight, Mail, Calculator, BarChart3, Scan, Scale } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const { data: cases, isLoading } = trpc.cases.getMyCases.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">טוען...</div>
      </DashboardLayout>
    );
  }

  const currentCase = selectedCaseId 
    ? cases?.find(c => c.id === selectedCaseId) 
    : cases?.[0];

  if (!currentCase && cases?.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">ברוכים הבאים, {user?.name}</h1>
            <p className="text-gray-600">בואו נתחיל בסיווג החוב שלך</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">עדיין לא יצרת תיק</h3>
                <p className="text-slate-400 mb-6">
                  בואו נתחיל בסיווג החוב שלך כדי לקבל תוכנית פעולה מותאמת אישית
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setLocation('/debt-form')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    התחל אבחון
                  </Button>
                  <Button
                    onClick={() => setLocation('/diagnosis-professional')}
                    variant="outline"
                  >
                    <Users className="w-4 h-4 ml-2" />
                    אבחון מקצועי
                  </Button>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold mb-2">ברוכים הבאים, {user?.name} 👋</h1>
          <p className="text-gray-600">הנה סיכום המצב של החובות שלך וצעדיך הבאים</p>
        </div>

        {/* Case Selector */}
        {cases && cases.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-300">בחר תיק:</span>
            <div className="flex gap-2 flex-wrap">
              {cases.map((caseItem) => (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCaseId(caseItem.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    selectedCaseId === caseItem.id || (!selectedCaseId && caseItem.id === cases[0]?.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {caseItem.debtType.replace('_', ' ')} - ₪{caseItem.totalDebtAmount}
                </button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                onClick={() => setLocation('/debt-form')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף חוב חדש
              </Button>
              <Button
                size="sm"
                onClick={() => setLocation('/diagnosis-professional')}
                variant="outline"
              >
                <Users className="w-4 h-4 ml-2" />
                אבחון מקצועי
              </Button>
            </div>
          </div>
        )}

        {/* 6 Main Cards Grid */}
        {currentCase && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Debt Status */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  מצב החוב שלי
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">סכום כולל</p>
                  <p className="text-3xl font-bold text-white">
                    ₪{currentCase.totalDebtAmount.toLocaleString('he-IL')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">חומרה</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${
                        currentCase.severity === 'low' ? 'bg-green-500' :
                        currentCase.severity === 'medium' ? 'bg-yellow-500' :
                        currentCase.severity === 'high' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm text-white font-medium">
                        {currentCase.severity === 'low' && 'נמוכה'}
                        {currentCase.severity === 'medium' && 'בינונית'}
                        {currentCase.severity === 'high' && 'גבוהה'}
                        {currentCase.severity === 'critical' && 'קריטית'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">סוג חוב</p>
                    <p className="text-sm text-white font-medium mt-1 capitalize">
                      {currentCase.debtType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Letters Generator */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setLocation('/letters')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                  מחולל מכתבים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300">צור מכתבי דרישה ותשובות</p>
                  <p className="text-xs text-slate-500 mt-1">לנושים ובנקים</p>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setLocation('/letters')}
                >
                  פתח מחולל <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Debt Calculator */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setLocation('/calculator')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Calculator className="w-5 h-5 text-green-400" />
                  מחשבון חוב
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300">חשב התחייבויות חודשיות</p>
                  <p className="text-xs text-slate-500 mt-1">וריביות</p>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setLocation('/calculator')}
                >
                  חשב עכשיו <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 4: Debt Tracker */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setLocation('/tracker')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  עקבות חוב
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300">עקוב אחר התקדמות</p>
                  <p className="text-xs text-slate-500 mt-1">והשלם חובות</p>
                </div>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setLocation('/tracker')}
                >
                  עקוב <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 5: Document Scanner */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setLocation('/scanner')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Scan className="w-5 h-5 text-orange-400" />
                  סריקת מסמכים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300">סרוק מסמכים עם OCR</p>
                  <p className="text-xs text-slate-500 mt-1">חילוץ נתונים אוטומטי</p>
                </div>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => setLocation('/scanner')}
                >
                  סרוק <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 6: Lawyers & Advisors */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setLocation('/lawyers')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Scale className="w-5 h-5 text-indigo-400" />
                  עורכי דין
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-300">מצא עורך דין או יועץ</p>
                  <p className="text-xs text-slate-500 mt-1">מומחה בחובות</p>
                </div>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => setLocation('/lawyers')}
                >
                  חפש <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
