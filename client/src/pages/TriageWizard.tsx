import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

const DEBT_CATEGORIES = [
  { value: 'credit_card', label: 'כרטיס אשראי', icon: '💳' },
  { value: 'bank', label: 'הלוואה בנקאית', icon: '🏦' },
  { value: 'personal_loan', label: 'הלוואה אישית', icon: '👤' },
  { value: 'mortgage', label: 'משכנתא', icon: '🏠' },
  { value: 'tax', label: 'חובות מס', icon: '📋' },
  { value: 'other', label: 'אחר', icon: '📌' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'נמוך - בשליטה', color: 'bg-green-500' },
  { value: 'medium', label: 'בינוני - דורש תשומת לב', color: 'bg-yellow-500' },
  { value: 'high', label: 'גבוה - דחוף', color: 'bg-orange-500' },
  { value: 'critical', label: 'קריטי - סיכון מיידי', color: 'bg-red-500' },
];

interface FormData {
  totalDebtAmount: string;
  debtType: string;
  collectionActions: string;
  additionalContext: string;
}

export default function TriageWizard() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    totalDebtAmount: '',
    debtType: '',
    collectionActions: '',
    additionalContext: '',
  });
  const [loading, setLoading] = useState(false);

  const createDebtProfile = trpc.cases.createDebtProfile.useMutation({
    onError: (error) => {
      console.error('[API Mutation Error]', error);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!formData.totalDebtAmount || !formData.debtType) {
        toast.error('אנא מלא את כל השדות הנדרשים');
        setLoading(false);
        return;
      }

      const result = await createDebtProfile.mutateAsync({
        totalDebtAmount: String(formData.totalDebtAmount),
        debtType: formData.debtType as 'bank' | 'credit_card' | 'personal_loan' | 'mortgage' | 'tax' | 'other',
        severity: 'medium' as const,
        persona: 'dana' as const,
      });

      if (!result) {
        throw new Error('לא קיבלנו תגובה מהשרת');
      }

      toast.success('הפרופיל שלך נוצר בהצלחה!');
      setLocation('/dashboard');
    } catch (error) {
      console.error('שגיאה:', error);
      toast.error('שגיאה ביצירת הפרופיל. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">אבחון החוב שלך</h1>
          <p className="text-slate-300">
            נשאל אותך כמה שאלות קצרות כדי להבין את מצב החוב שלך ולהתאים לך את הצעד הבא
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">שלב {currentStep} מתוך 3</span>
            <span className="text-sm text-slate-400">כ-2 דקות</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-800 border-slate-700 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-white text-2xl">
              {currentStep === 1 && 'סוג החוב'}
              {currentStep === 2 && 'סכום החוב'}
              {currentStep === 3 && 'מידע נוסף'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {currentStep === 1 && 'בחר את סוג החוב הראשי שלך'}
              {currentStep === 2 && 'ספר לנו כמה אתה חייב בערך'}
              {currentStep === 3 && 'מידע נוסף שיעזור לנו להבין את המצב'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Debt Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEBT_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleInputChange('debtType', category.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.debtType === category.value
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="font-medium text-white">{category.label}</div>
                    </button>
                  ))}
                </div>
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                  <p className="text-sm text-slate-300">
                    💡 <strong>עצה:</strong> בחר את סוג החוב הגדול ביותר או החשוב ביותר
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Debt Amount */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    סכום החוב הכולל (בש"ח)
                  </label>
                  <Input
                    type="number"
                    placeholder="לדוגמה: 50000"
                    value={formData.totalDebtAmount}
                    onChange={(e) => handleInputChange('totalDebtAmount', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    זה עוזר לנו להבין את חומרת המצב ולהתאים לך את הפתרון הטוב ביותר
                  </p>
                </div>

                {formData.totalDebtAmount && (
                  <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">סכום שהזנת: ₪{parseInt(formData.totalDebtAmount).toLocaleString('he-IL')}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          אם זה לא נכון, אתה יכול לתקן זאת בכל עת
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Additional Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    האם יש הוצאה לפועל או הליך משפטי?
                  </label>
                  <Textarea
                    placeholder="לדוגמה: יש לי מכתב מעו״ד, או יש עיקול על חשבון בנק"
                    value={formData.collectionActions}
                    onChange={(e) => handleInputChange('collectionActions', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-24"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    מידע נוסף שחשוב לנו לדעת
                  </label>
                  <Textarea
                    placeholder="לדוגמה: אני עצמאי, או אני בתהליך פשיטת רגל"
                    value={formData.additionalContext}
                    onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 min-h-24"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-300">בסיום תקבל:</p>
                      <ul className="text-xs text-blue-200 mt-2 space-y-1">
                        <li>✓ סיכום מצב החוב שלך</li>
                        <li>✓ המלצה על בעל מקצוע מתאים</li>
                        <li>✓ תוכנית פעולה ראשונית</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                חזור
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !formData.debtType) ||
                    (currentStep === 2 && !formData.totalDebtAmount) ||
                    loading
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  הבא <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'מעבד...' : 'סיים אבחון'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => step < currentStep && setCurrentStep(step)}
              className={`w-3 h-3 rounded-full transition-all ${
                step === currentStep
                  ? 'bg-blue-500 w-8'
                  : step < currentStep
                  ? 'bg-green-500 cursor-pointer hover:bg-green-400'
                  : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
