import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { CheckCircle, AlertCircle, TrendingUp, Users, FileText, CheckSquare, Share2, Download, Phone } from 'lucide-react';

interface DiagnosisResult {
  totalScore: number;
  riskLevel: 'נמוך' | 'בינוני' | 'גבוה' | 'קריטי';
  persona: {
    name: string;
    emoji: string;
    description: string;
    characteristics: string[];
    recommendedPath: string;
    estimatedTimeToResolution: string;
    successRate: number;
    costEstimate: string;
  };
  recommendation: string;
  nextSteps: string[];
  matchedProfessionals: Array<{
    id: string;
    name: string;
    specialty: string;
    matchPercentage: number;
    experience: number;
    successRate: number;
  }>;
  legalConsiderations: Array<{
    law: string;
    applicability: boolean;
    description: string;
    action: string;
  }>;
  automatedTasks: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}

export default function DiagnosisResults() {
  const [, setLocation] = useLocation();
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null);

  // Mock data - in production, this would come from the diagnosis engine
  const result: DiagnosisResult = {
    totalScore: 145,
    riskLevel: 'בינוני',
    persona: {
      name: 'דנה',
      emoji: '🟡',
      description: 'מקרה מורכב - דנה צריכה ייעוץ מקצועי ותמיכה מתמשכת',
      characteristics: ['מספר חובות (2-4)', 'סכומים בינוניים עד גדולים', 'תביעות משפטיות', 'הכנסה לא יציבה'],
      recommendedPath: 'עורך דין בחובות + יועץ הסדרים',
      estimatedTimeToResolution: '2-4 חודשים',
      successRate: 0.85,
      costEstimate: '2000-5000 ש"ח',
    },
    recommendation: 'מקרה מורכב - דנה צריכה ייעוץ מקצועי ותמיכה מתמשכת. עורך דין בחובות + יועץ הסדרים',
    nextSteps: [
      '1. התייעץ עם עורך דין בחובות בעניין התביעה',
      '2. אסוף את כל מספרי התיקים המשפטיים',
      '3. בנה תוכנית הסדרים מובנית',
      '4. שקול הסדר כולל עם הנושים',
    ],
    matchedProfessionals: [
      {
        id: 'prof_1',
        name: 'עו"ד רחל לוי',
        specialty: 'הסדרי חובות',
        matchPercentage: 92,
        experience: 12,
        successRate: 0.85,
      },
      {
        id: 'prof_2',
        name: 'יועץ כלכלי דוד',
        specialty: 'ייעוץ כלכלי',
        matchPercentage: 88,
        experience: 10,
        successRate: 0.82,
      },
      {
        id: 'prof_3',
        name: 'עו"ד מוטי כהן',
        specialty: 'חובות ותביעות',
        matchPercentage: 85,
        experience: 15,
        successRate: 0.88,
      },
    ],
    legalConsiderations: [
      {
        law: 'תיקון 13 לחוק הגנת הפרטיות',
        applicability: true,
        description: 'הגנה על מידע אישי בתהליך הטיפול בחובות',
        action: 'יש לחתום על הסכם הסכמה לעיבוד מידע',
      },
      {
        law: 'חוק הסדרי חובות',
        applicability: true,
        description: 'אפשרות להסדר כולל עם כל הנושים',
        action: 'שקול הסדר כולל עם כל הנושים',
      },
      {
        law: 'חוק הוצאה לפועל',
        applicability: true,
        description: 'זכויות החייב בהליך הוצאה לפועל',
        action: 'פנה לעורך דין לבדיקת זכויותיך',
      },
    ],
    automatedTasks: [
      {
        id: 'task_1',
        title: 'אסוף מספרי תיקים',
        description: 'אסוף את מספרי התיקים מכל הגופים המשפטיים',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
      },
      {
        id: 'task_2',
        title: 'אסוף מסמכים רלוונטיים',
        description: 'אסוף חשבוניות, הודעות משפטיות, ותיקים',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        status: 'pending',
      },
      {
        id: 'task_3',
        title: 'קבע פגישה עם מומחה',
        description: 'קבע פגישה עם עורך דין בחובות',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'pending',
      },
      {
        id: 'task_4',
        title: 'תכנן תוכנית פיננסית',
        description: 'בנה תוכנית תשלומים בהתאם ליכולתך',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        status: 'pending',
      },
    ],
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'נמוך':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'בינוני':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'גבוה':
        return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'קריטי':
        return 'bg-red-500/20 text-red-600 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">תוצאות האבחון שלך</h1>
          <p className="text-gray-400">ניתוח מלא של מצב החוב שלך עם המלצות מותאמות</p>
        </div>

        {/* Persona Card */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-8">
          <div className="flex items-start gap-6">
            <div className="text-6xl">{result.persona.emoji}</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">סיווג: {result.persona.name}</h2>
              <p className="text-gray-300 mb-4">{result.persona.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">זמן משוער לפתרון</p>
                  <p className="text-lg font-semibold text-white">{result.persona.estimatedTimeToResolution}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">שיעור הצלחה</p>
                  <p className="text-lg font-semibold text-white">{Math.round(result.persona.successRate * 100)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">הערכת עלות</p>
                  <p className="text-lg font-semibold text-white">{result.persona.costEstimate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">המלצה</p>
                  <p className="text-lg font-semibold text-blue-400">{result.persona.recommendedPath}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk Score */}
        <Card className={`border mb-8 p-6 ${getRiskColor(result.riskLevel)}`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{result.totalScore}</div>
            <div>
              <p className="text-sm opacity-75">ניקוד סיכון כולל</p>
              <p className="text-2xl font-bold">רמת סיכון: {result.riskLevel}</p>
            </div>
          </div>
        </Card>

        {/* Recommendation */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <div className="flex gap-4">
            <TrendingUp className="text-blue-400 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">המלצה</h3>
              <p className="text-gray-300">{result.recommendation}</p>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <div className="flex gap-4 mb-4">
            <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
            <h3 className="text-xl font-bold text-white">צעדים הבאים</h3>
          </div>
          <ul className="space-y-3">
            {result.nextSteps.map((step, index) => (
              <li key={index} className="text-gray-300 flex gap-3">
                <span className="text-blue-400 font-semibold">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Matched Professionals */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <div className="flex gap-4 mb-6">
            <Users className="text-purple-400 flex-shrink-0" size={24} />
            <h3 className="text-xl font-bold text-white">מומחים מומלצים</h3>
          </div>
          <div className="space-y-4">
            {result.matchedProfessionals.map((prof) => (
              <div key={prof.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-blue-500 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{prof.name}</h4>
                    <p className="text-sm text-gray-400">{prof.specialty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-400">{prof.matchPercentage}%</p>
                    <p className="text-xs text-gray-400">התאמה</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">ניסיון</p>
                    <p className="text-white font-semibold">{prof.experience} שנים</p>
                  </div>
                  <div>
                    <p className="text-gray-400">שיעור הצלחה</p>
                    <p className="text-white font-semibold">{Math.round(prof.successRate * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-400">מקרים דומים</p>
                    <p className="text-white font-semibold">150+</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedProfessional(prof.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Phone size={16} className="mr-2" />
                  קבע פגישה
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Legal Considerations */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <div className="flex gap-4 mb-6">
            <AlertCircle className="text-yellow-400 flex-shrink-0" size={24} />
            <h3 className="text-xl font-bold text-white">שיקולים משפטיים</h3>
          </div>
          <div className="space-y-4">
            {result.legalConsiderations.map((consideration, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex gap-3 mb-2">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <h4 className="font-semibold text-white">{consideration.law}</h4>
                </div>
                <p className="text-gray-300 mb-2 text-sm">{consideration.description}</p>
                <p className="text-blue-400 text-sm">
                  <strong>פעולה:</strong> {consideration.action}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Automated Tasks */}
        <Card className="bg-slate-800 border-slate-700 mb-8 p-6">
          <div className="flex gap-4 mb-6">
            <CheckSquare className="text-cyan-400 flex-shrink-0" size={24} />
            <h3 className="text-xl font-bold text-white">משימות אוטומטיות</h3>
          </div>
          <div className="space-y-3">
            {result.automatedTasks.map((task) => (
              <div key={task.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">{task.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{task.description}</p>
                <p className="text-xs text-gray-500">
                  תאריך יעד: {new Date(task.dueDate).toLocaleDateString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle size={16} className="mr-2" />
            חזור לדשבורד
          </Button>
          <Button
            onClick={() => {}}
            variant="outline"
            className="flex-1 border-slate-600 text-white hover:bg-slate-700"
          >
            <Download size={16} className="mr-2" />
            הורד דוח
          </Button>
          <Button
            onClick={() => {}}
            variant="outline"
            className="flex-1 border-slate-600 text-white hover:bg-slate-700"
          >
            <Share2 size={16} className="mr-2" />
            שתף
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm">
          <p>זה אבחון ראשוני. לקבלת ייעוץ משפטי מקצועי, אנא פנה לעורך דין מוסמך.</p>
        </div>
      </div>
    </div>
  );
}
