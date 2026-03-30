import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cases, isLoading } = trpc.cases.getMyCases.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">טוען...</div>
      </DashboardLayout>
    );
  }

  const currentCase = cases?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">ברוכים הבאים, {user?.name}</h1>
          <p className="text-slate-400">הנה סטטוס החוב שלך והצעדים הבאים</p>
        </div>

        {/* Status Cards */}
        {currentCase ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Severity Badge */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">רמת חומרה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentCase.severity === 'low' && '🟢 נמוכה'}
                  {currentCase.severity === 'medium' && '🟡 בינונית'}
                  {currentCase.severity === 'high' && '🔴 גבוהה'}
                  {currentCase.severity === 'critical' && '🔴🔴 קריטית'}
                </div>
                <p className="text-slate-400 text-sm mt-2">סטטוס הסיווג שלך</p>
              </CardContent>
            </Card>

            {/* Total Debt */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">סכום חוב כולל</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{currentCase.totalDebtAmount} ש"ח</div>
                <p className="text-slate-400 text-sm mt-2">חוב פעיל</p>
              </CardContent>
            </Card>

            {/* Persona */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">הפרסונה שלך</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentCase.persona === 'yossi' && '👨 יוסי'}
                  {currentCase.persona === 'dana' && '👩 דנה'}
                  {currentCase.persona === 'avi' && '👨‍⚖️ אבי'}
                </div>
                <p className="text-slate-400 text-sm mt-2">סיווג אישי</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-300 mb-4">עדיין לא בצעת אבחון. בואו נתחיל!</p>
              <Button
                onClick={() => setLocation('/triage')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                התחל אבחון
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {currentCase && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">הצעדים הבאים</CardTitle>
              <CardDescription className="text-slate-400">
                מה אתה צריך לעשות עכשיו
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold">העלה מסמכים</h4>
                    <p className="text-slate-400 text-sm">
                      העלה מסמכים משפטיים וכלכליים כדי שנוכל לעזור לך בצורה טובה יותר
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold">התחבר למומחה</h4>
                    <p className="text-slate-400 text-sm">
                      בחר מומחה מתאים לסוג החוב שלך ותתחבר אליו בלחיצת כפתור
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold">עקוב אחרי התקדמות</h4>
                    <p className="text-slate-400 text-sm">
                      תקבל תזכורות וקדימויות לכל משימה חשובה
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={() => setLocation('/documents')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 h-12"
          >
            📄 מסמכים שלי
          </Button>
          <Button
            onClick={() => setLocation('/tasks')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 h-12"
          >
            ✓ המשימות שלי
          </Button>
          <Button
            onClick={() => setLocation('/professionals')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 h-12"
          >
            👥 מומחים
          </Button>
          <Button
            onClick={() => setLocation('/settings')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-700 h-12"
          >
            ⚙️ הגדרות
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
