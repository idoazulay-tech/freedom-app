import { useState } from 'react';
import { Streamdown } from 'streamdown';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import {
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  CheckSquare,
  Share2,
  Download,
  Phone,
  Calendar,
  DollarSign,
  Target,
  Award,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface DiagnosisResult {
  persona: 'Yossi' | 'Dana' | 'Avi';
  personaDescription: string;
  riskScore: number;
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';
  totalDebt: number;
  monthlyAvailable: number;
  debtToIncomeRatio: number;
  recommendations: string[];
  legalConsiderations: string[];
  warningSigns: string[];
  solutions: Array<{
    name: string;
    description: string;
    difficulty: string;
    timeframe: string;
  }>;
  automatedTasks: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  matchedProfessionals: Array<{
    name: string;
    specialty: string;
    matchPercentage: number;
    successRate: number;
    experience: number;
  }>;
  nextSteps: string[];
  debtBreakdown: Array<{
    type: string;
    amount: number;
    riskScore: number;
    solutions: string[];
  }>;
}

export default function DiagnosisResults() {
  const [, setLocation] = useLocation();
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);
  const [tasksCompleted, setTasksCompleted] = useState<Set<number>>(new Set());

  const toggleTask = (idx: number) => {
    const newCompleted = new Set(tasksCompleted);
    if (newCompleted.has(idx)) {
      newCompleted.delete(idx);
    } else {
      newCompleted.add(idx);
    }
    setTasksCompleted(newCompleted);
  };

  // Get diagnosis result from session storage or use mock data
  const result: DiagnosisResult = JSON.parse(sessionStorage.getItem('diagnosisResult') || 'null') || {
    persona: 'Dana',
    personaDescription: 'דנה - מצב בינוני עם אתגרים. צריך ליווי מקצועי.',
    riskScore: 95,
    riskLevel: 'בינוני',
    totalDebt: 150000,
    monthlyAvailable: 2000,
    debtToIncomeRatio: 2.5,
    recommendations: [
      'פנה לעורך דין המתמחה בדיני חובות',
      'בנה תוכנית תשלומים מפורטת',
      'אסוף את כל המסמכים הרלוונטיים',
    ],
    legalConsiderations: [
      'בדוק את זכויותיך לפי חוק הגנת הצרכן',
      'שמור על כל התיקיות והמסמכים',
      'דע את הגבלות החוקיות על גבייה',
    ],
    warningSigns: [
      '⚠️ יש הוצאה לפועל פעילה',
      '⚠️ יש הודעות משפטיות',
      '⚠️ יש 3 נושים שונים',
    ],
    solutions: [
      {
        name: 'תוכנית תשלומים מובנית',
        description: 'תוכנית תשלומים קבועה בהתאם ליכולתך',
        difficulty: 'easy',
        timeframe: '12-24 חודשים',
      },
      {
        name: 'איחוד חובות',
        description: 'איחוד כל החובות להלוואה אחת בריבית נמוכה יותר',
        difficulty: 'medium',
        timeframe: '18-36 חודשים',
      },
    ],
    automatedTasks: [
      {
        title: 'אסוף מסמכים',
        description: 'אסוף חשבוניות, הודעות משפטיות, תיקים, הסכמים',
        priority: 'high',
      },
      {
        title: 'בדוק זכויות',
        description: 'בדוק את זכויותיך לפי חוק הגנת הצרכן וחוקים רלוונטיים',
        priority: 'high',
      },
    ],
    matchedProfessionals: [
      {
        name: 'עו"ד דוד כהן',
        specialty: 'דיני חובות ופשיטת רגל',
        matchPercentage: 95,
        successRate: 92,
        experience: 15,
      },
      {
        name: 'יועץ פיננסי אברהם שמעון',
        specialty: 'תכניות תשלומים וסידור חובות',
        matchPercentage: 85,
        successRate: 90,
        experience: 10,
      },
    ],
    nextSteps: [
      'קבע פגישה עם מומחה בשבוע הקרוב',
      'הכן רשימה של כל החובות וסכומיהם',
      'תכנן תוכנית תשלומים בהתאם ליכולתך',
    ],
    debtBreakdown: [
      {
        type: 'כרטיס אשראי',
        amount: 30000,
        riskScore: 120,
        solutions: ['סידור חוב', 'הפחתת ריבית'],
      },
      {
        type: 'הלוואה מבנק',
        amount: 80000,
        riskScore: 60,
        solutions: ['סידור חוב', 'הארכת תקופה'],
      },
      {
        type: 'חוב מס',
        amount: 40000,
        riskScore: 140,
        solutions: ['סידור חוב עם רשויות המס', 'תוכנית תשלומים משפטית'],
      },
    ],
  };

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
        return <CheckCircle className="w-6 h-6" />;
      case 'בינוני':
        return <AlertCircle className="w-6 h-6" />;
      case 'גבוה':
        return <AlertTriangle className="w-6 h-6" />;
      case 'קריטי':
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">תוצאות אבחון החוב</h1>
            <p className="text-gray-600 mt-2">אבחון מלא ומפורט של מצב החוב שלך</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 ml-2" />
              שתף
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 ml-2" />
              הורד דוח
            </Button>
          </div>
        </div>

        {/* Risk Level Card */}
        <Card className={`p-6 border-2 ${getRiskLevelColor(result.riskLevel)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {getRiskLevelIcon(result.riskLevel)}
              <div>
                <h2 className="text-2xl font-bold">רמת סיכון: {result.riskLevel}</h2>
                <p className="text-sm mt-2">ניקוד סיכון: {result.riskScore}/200</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round((result.riskScore / 200) * 100)}%</div>
              <p className="text-sm text-gray-600">מדד סיכון</p>
            </div>
          </div>
        </Card>

        {/* Persona Card */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">הסיווג שלך</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-4xl mb-2">
                {result.persona === 'Yossi' ? '🟢' : result.persona === 'Dana' ? '🟡' : '🔴'}
              </div>
              <h4 className="text-lg font-bold">{result.persona}</h4>
              <p className="text-sm text-gray-600 mt-2">{result.personaDescription}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-bold">סה"כ חובות</span>
              </div>
              <p className="text-2xl font-bold">₪{result.totalDebt.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">יחס חוב להכנסה: {result.debtToIncomeRatio.toFixed(1)}x</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">זמין לתשלום</span>
              </div>
              <p className="text-2xl font-bold">₪{result.monthlyAvailable.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">לחודש</p>
            </div>
          </div>
        </Card>

        {/* Warning Signs */}
        {result.warningSigns.length > 0 && (
          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              סימני אזהרה
            </h3>
            <div className="space-y-2">
              {result.warningSigns.map((sign, idx) => (
                <div key={idx} className="flex items-center gap-2 text-red-700">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  {sign}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Debt Breakdown */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">פירוט החובות</h3>
          <div className="space-y-4">
            {result.debtBreakdown.map((debt, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{debt.type}</h4>
                  <span className="text-lg font-bold">₪{debt.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">ניקוד סיכון: {debt.riskScore}/200</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {debt.solutions.map((solution, sIdx) => (
                    <span key={sIdx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {solution}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Solutions */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">פתרונות אפשריים</h3>
          <div className="space-y-4">
            {result.solutions.map((solution, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{solution.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(solution.difficulty)}`}>
                    {solution.difficulty === 'easy'
                      ? 'קל'
                      : solution.difficulty === 'medium'
                        ? 'בינוני'
                        : 'קשה'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{solution.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{solution.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">המלצות</h3>
          <div className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Legal Considerations */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">שיקולים משפטיים</h3>
          <div className="space-y-3">
            {result.legalConsiderations.map((consideration, idx) => (
              <div key={idx} className="flex gap-3">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{consideration}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Matched Professionals */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            מומחים מומלצים
          </h3>
          <div className="space-y-4">
            {result.matchedProfessionals.map((prof, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  selectedProfessional === prof.name ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => setSelectedProfessional(prof.name)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold">{prof.name}</h4>
                    <p className="text-sm text-gray-600">{prof.specialty}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{prof.matchPercentage}%</div>
                    <p className="text-xs text-gray-600">התאמה</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span>שיעור הצלחה: {prof.successRate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>ניסיון: {prof.experience} שנים</span>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm">
                  <Phone className="w-4 h-4 ml-2" />
                  צור קשר
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Automated Tasks */}
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            משימות אוטומטיות
          </h3>
          <div className="space-y-3">
            {result.automatedTasks.map((task, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={tasksCompleted.has(idx)}
                    onChange={() => toggleTask(idx)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold ${tasksCompleted.has(idx) ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${tasksCompleted.has(idx) ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-xl font-bold mb-4">הצעדים הבאים</h3>
          <ol className="space-y-3">
            {result.nextSteps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="font-bold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                <p className="text-gray-700">{step}</p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button size="lg" onClick={() => setLocation('/dashboard')}>
            חזור לדשבורד
          </Button>
          <Button size="lg" variant="outline">
            שמור את הדוח
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
