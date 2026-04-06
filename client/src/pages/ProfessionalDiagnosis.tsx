import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

interface FormData {
  debts: Array<{ category: string; amount: number; riskScore: number; creditorName?: string; caseNumber?: string; interestRate?: number; enforcementDate?: string }>;
  totalRisk: number;
  totalAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  diagnosisData: Record<string, any>;
}

export default function ProfessionalDiagnosis() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    debts: [],
    totalRisk: 0,
    totalAmount: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    hasEnforcement: false,
    hasWarningLetters: false,
    diagnosisData: {},
  });

  const saveMutation = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success('אבחון נשמר בהצלחה!');
      setTimeout(() => {
        setLocation('/profile');
      }, 1000);
    },
    onError: (error: any) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const availableForDebt = Math.max(0, formData.monthlyIncome - formData.monthlyExpenses);
      await saveMutation.mutateAsync({
        riskScore: formData.totalRisk,
        riskLevel: formData.totalRisk > 150 ? 'critical' : formData.totalRisk > 100 ? 'high' : formData.totalRisk > 50 ? 'medium' : 'low',
        totalDebt: formData.totalAmount,
        monthlyIncome: formData.monthlyIncome,
        monthlyExpenses: formData.monthlyExpenses,
        availableForDebt,
        creditorCount: formData.debts.length,
        hasEnforcement: formData.hasEnforcement,
        hasWarningLetters: formData.hasWarningLetters,
        debtsData: JSON.stringify(formData.debts),
        actionsData: JSON.stringify([]),
      });
    } catch (error) {
      console.error('Error saving diagnosis:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">אבחון מקצועי</h1>
          <p className="text-slate-400">שלב {step} מתוך 4</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {step === 1 && 'בחר סוג חוב'}
              {step === 2 && 'הוסף פרטי חוב'}
              {step === 3 && 'שאלות אבחון'}
              {step === 4 && 'סיכום וביקורת'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Category Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-slate-300">בחר את סוג החוב שלך:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    'כרטיס אשראי',
                    'הלוואה מחברת אשראי',
                    'הלוואה על מסגרת אשראי (Credit Line)',
                    'הלוואה בנקאית',
                    'הלוואה אישית',
                    'משכנתא',
                    'חובות מס',
                    'חובות עירוניים',
                    'חוב לעירייה',
                    'חוב לביטוח לאומי',
                    'חוב לספק חשמל/מים',
                    'חוב לבנק ישראל',
                    'חוב למגדל',
                    'חוב לפקיד הגבייה',
                    'אחר'
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          debts: [{ category, amount: 0, riskScore: 0 }],
                        });
                        handleNext();
                      }}
                      className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-right transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Debt Details */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-slate-300 mb-4">הוסף פרטי החוב:</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-white block mb-2">סכום החוב (₪)</label>
                    <input
                      type="number"
                      placeholder="הקלד את סכום החוב"
                      value={formData.totalAmount || ''}
                      onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                    {formData.totalAmount > 0 && (
                      <div className="mt-2 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                        <p className="text-blue-300 text-sm">סכום: ₪{formData.totalAmount.toLocaleString('he-IL')}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-white block mb-2">שם הנושה</label>
                    <input
                      type="text"
                      placeholder="הקלד את שם הנושה"
                      value={formData.debts[0]?.creditorName || ''}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        if (newDebts[0]) newDebts[0].creditorName = e.target.value;
                        setFormData({ ...formData, debts: newDebts });
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">מספר תיק משפטי (אם קיים)</label>
                    <input
                      type="text"
                      placeholder="מספר תיק"
                      value={formData.debts[0]?.caseNumber || ''}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        if (newDebts[0]) newDebts[0].caseNumber = e.target.value;
                        setFormData({ ...formData, debts: newDebts });
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">שיעור ריביות (%)</label>
                    <input
                      type="number"
                      placeholder="שיעור ריביות"
                      value={formData.debts[0]?.interestRate || ''}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        if (newDebts[0]) newDebts[0].interestRate = Number(e.target.value);
                        setFormData({ ...formData, debts: newDebts });
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">תאריך הוצל"פ (אם קיים)</label>
                    <input
                      type="date"
                      value={formData.debts[0]?.enforcementDate || ''}
                      onChange={(e) => {
                        const newDebts = [...formData.debts];
                        if (newDebts[0]) newDebts[0].enforcementDate = e.target.value;
                        setFormData({ ...formData, debts: newDebts });
                      }}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">ניקוד סיכון (0-200)</label>
                    <input
                      type="number"
                      placeholder="ניקוד סיכון"
                      value={formData.totalRisk || ''}
                      onChange={(e) => setFormData({ ...formData, totalRisk: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      min="0"
                      max="200"
                    />
                  </div>

                  <textarea
                    placeholder="הערה על החוב (אופציונלי)"
                    value={formData.diagnosisData.notes || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      diagnosisData: { ...formData.diagnosisData, notes: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Diagnosis Questions */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-slate-300 mb-4">עונה על השאלות הבאות:</p>
                <div className="space-y-4">
                  {/* Income */}
                  <div>
                    <label className="text-white block mb-2">הכנסה חודשית (₪)</label>
                    <input
                      type="number"
                      placeholder="הכנסה חודשית"
                      value={formData.monthlyIncome || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Expenses */}
                  <div>
                    <label className="text-white block mb-2">הוצאות חודשיות (₪)</label>
                    <input
                      type="number"
                      placeholder="הוצאות חודשיות"
                      value={formData.monthlyExpenses || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Enforcement */}
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                    <input
                      type="checkbox"
                      id="enforcement"
                      checked={formData.hasEnforcement}
                      onChange={(e) => setFormData({ ...formData, hasEnforcement: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="enforcement" className="text-white cursor-pointer flex-1">
                      האם יש הוצל"פ פעיל?
                    </label>
                  </div>

                  {/* Warning Letters */}
                  <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                    <input
                      type="checkbox"
                      id="warnings"
                      checked={formData.hasWarningLetters}
                      onChange={(e) => setFormData({ ...formData, hasWarningLetters: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="warnings" className="text-white cursor-pointer flex-1">
                      האם יש מכתבי התראה?
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-4">
                {/* Risk Level Badge */}
                <div className={`rounded-lg p-4 space-y-2 ${
                  formData.totalRisk > 150 ? 'bg-red-900/30 border border-red-600' :
                  formData.totalRisk > 100 ? 'bg-orange-900/30 border border-orange-600' :
                  formData.totalRisk > 50 ? 'bg-yellow-900/30 border border-yellow-600' :
                  'bg-green-900/30 border border-green-600'
                }`}>
                  <p className="text-slate-400">רמת סיכון:</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      formData.totalRisk > 150 ? 'bg-red-600 text-white' :
                      formData.totalRisk > 100 ? 'bg-orange-600 text-white' :
                      formData.totalRisk > 50 ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }`}>
                      {formData.totalRisk > 150 ? '🔴 קריטי' :
                       formData.totalRisk > 100 ? '🟠 גבוה' :
                       formData.totalRisk > 50 ? '🟡 בינוני' :
                       '🟢 נמוך'}
                    </span>
                    <p className="text-white font-bold">{formData.totalRisk}/200</p>
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">סכום כולל:</p>
                  <p className="text-2xl font-bold text-white">₪{formData.totalAmount.toLocaleString('he-IL')}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">ניקוד סיכון:</p>
                  <p className="text-2xl font-bold text-white">{formData.totalRisk}/200</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">הכנסה חודשית:</p>
                  <p className="text-xl font-bold text-white">₪{formData.monthlyIncome.toLocaleString('he-IL')}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">הוצאות חודשיות:</p>
                  <p className="text-xl font-bold text-white">₪{formData.monthlyExpenses.toLocaleString('he-IL')}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">זמין לחוב:</p>
                  <p className={`text-xl font-bold ${Math.max(0, formData.monthlyIncome - formData.monthlyExpenses) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₪{Math.max(0, formData.monthlyIncome - formData.monthlyExpenses).toLocaleString('he-IL')}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className={`flex-1 rounded-lg p-4 border ${
                    formData.hasEnforcement ? 'bg-red-900/30 border-red-600' : 'bg-green-900/30 border-green-600'
                  }`}>
                    <p className="text-slate-400 text-sm">הוצל"פ פעיל:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        formData.hasEnforcement ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                      }`}>
                        {formData.hasEnforcement ? '🔴 כן' : '🟢 לא'}
                      </span>
                    </div>
                  </div>
                  <div className={`flex-1 rounded-lg p-4 border ${
                    formData.hasWarningLetters ? 'bg-red-900/30 border-red-600' : 'bg-green-900/30 border-green-600'
                  }`}>
                    <p className="text-slate-400 text-sm">מכתבי התראה:</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        formData.hasWarningLetters ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                      }`}>
                        {formData.hasWarningLetters ? '🔴 כן' : '🟢 לא'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">💡 המלצות:</p>
                  <ul className="space-y-1 text-sm text-white">
                    {formData.totalRisk > 150 && <li>• מצב קריטי - דרוש ייעוץ משפטי דחוף</li>}
                    {formData.totalRisk > 100 && <li>• יש להתחיל משא ומתן עם נושים</li>}
                    {formData.hasEnforcement && <li>• דרוש עו"ד להתמודדות עם הוצל"פ</li>}
                    {formData.hasWarningLetters && <li>• יש להגיב על מכתבי התראה בהקדם</li>}
                    {Math.max(0, formData.monthlyIncome - formData.monthlyExpenses) > 0 && <li>• אפשר להתחיל בפירעון חוב מיידי</li>}
                    {Math.max(0, formData.monthlyIncome - formData.monthlyExpenses) === 0 && <li>• יש להקטין הוצאות או להגדיל הכנסה</li>}
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6">
              {step > 1 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  חזור
                </Button>
              )}
              {step < 4 && (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  הבא
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              )}
              {step === 4 && (
                <Button
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saveMutation.isPending ? 'שומר...' : 'סיים אבחון'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
