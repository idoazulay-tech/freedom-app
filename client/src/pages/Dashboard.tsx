import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckSquare, Users, TrendingDown, AlertCircle, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';
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
            <h1 className="text-3xl font-bold text-white mb-2">ברוכים הבאים, {user?.name}</h1>
            <p className="text-slate-400">בואו נתחיל בסיווג החוב שלך</p>
          </div>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">עדיין לא יצרת תיק</h3>
                <p className="text-slate-400 mb-6">
                  בואו נתחיל בסיווג החוב שלך כדי לקבל תוכנית פעולה מותאמת אישית
                </p>
                <Button
                  onClick={() => setLocation('/triage')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  התחל אבחון
                </Button>
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
          <h1 className="text-3xl font-bold text-white mb-2">ברוכים הבאים, {user?.name} 👋</h1>
          <p className="text-slate-400">הנה סיכום המצב של החובות שלך וצעדיך הבאים</p>
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
            <Button
              size="sm"
              onClick={() => setLocation('/triage')}
              className="ml-auto bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף חוב חדש
            </Button>
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

            {/* Card 2: Next Steps */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                  מה לעשות עכשיו
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-2 bg-slate-700/50 rounded">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">1</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">העלה מסמכים</p>
                      <p className="text-xs text-slate-400">חוזים, מכתבים</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-2 bg-slate-700/30 rounded">
                    <div className="w-5 h-5 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">2</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-300">בחר בעל מקצוע</p>
                      <p className="text-xs text-slate-500">עו"ד או יועץ</p>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                  התחל עכשיו <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card 3: Professional */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-purple-400" />
                  בעל מקצוע
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-400">עדיין לא בחרת בעל מקצוע</p>
                  <p className="text-xs text-slate-500 mt-1">זה יעזור לך להתקדם בפתרון החוב</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => setLocation('/professionals')}
                >
                  חפש בעל מקצוע
                </Button>
              </CardContent>
            </Card>

            {/* Card 4: Documents */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-green-400" />
                  מסמכים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-slate-400 mt-1">מסמכים מוצפנים</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => setLocation('/documents')}
                >
                  העלה מסמך
                </Button>
              </CardContent>
            </Card>

            {/* Card 5: Tasks */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <CheckSquare className="w-5 h-5 text-orange-400" />
                  משימות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-xs text-slate-400 mt-1">משימות פעילות</p>
                </div>
                <div className="text-xs text-slate-400 text-center p-2 bg-slate-700/30 rounded">
                  משימות יופיעו כשתחבר בעל מקצוע
                </div>
              </CardContent>
            </Card>

            {/* Card 6: Progress */}
            <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <TrendingDown className="w-5 h-5 text-indigo-400" />
                  התקדמות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs text-white">✓ אבחון הושלם</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                    <span className="text-xs text-slate-400">בחירת מומחה</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                    <span className="text-xs text-slate-400">תוכנית פעולה</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-600" />
                    <span className="text-xs text-slate-400">סיום</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
