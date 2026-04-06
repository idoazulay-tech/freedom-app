import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

// Debt types with all 12 categories
const DEBT_TYPES = [
  { value: 'credit_card', label: 'כרטיס אשראי' },
  { value: 'personal_loan', label: 'הלוואה אישית' },
  { value: 'credit_line', label: 'Credit Line' },
  { value: 'mortgage', label: 'משכנתא' },
  { value: 'bank_loan', label: 'הלוואה בנקאית' },
  { value: 'taxes', label: 'חובות מס' },
  { value: 'municipality', label: 'חוב לעירייה' },
  { value: 'national_insurance', label: 'חוב לביטוח לאומי' },
  { value: 'utilities', label: 'חוב לספק חשמל/מים' },
  { value: 'bank_israel', label: 'חוב לבנק ישראל' },
  { value: 'collection_agency', label: 'חוב למגדל' },
  { value: 'other', label: 'אחר' },
];

interface Debt {
  id: string;
  category: string;
  amount: number;
  riskScore: number;
  creditorName: string;
  caseNumber: string;
  interestRate: number;
  enforcementDate: string;
  debtStartDate: string;
  paymentStatus: 'current' | 'late' | 'defaulted';
  monthlyPayment: number;
}

interface FormData {
  debts: Debt[];
  totalRisk: number;
  totalAmount: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  previousNegotiations: boolean;
  needsLegalHelp: boolean;
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
    previousNegotiations: false,
    needsLegalHelp: false,
  });

  const [currentDebt, setCurrentDebt] = useState<Partial<Debt>>({
    category: '',
    amount: 0,
    riskScore: 0,
    creditorName: '',
    caseNumber: '',
    interestRate: 0,
    enforcementDate: '',
    debtStartDate: '',
    paymentStatus: 'current',
    monthlyPayment: 0,
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

  // Calculate risk level (Yossi/Dana/Avi/Green)
  const getRiskLevel = (score: number) => {
    if (score >= 150) return { label: 'Yossi', color: 'text-red-500 bg-red-500/20', description: 'קריטי - צריך עזרה משפטית מיידית' };
    if (score >= 100) return { label: 'Dana', color: 'text-orange-500 bg-orange-500/20', description: 'גבוה - צריך ייעוץ כלכלי' };
    if (score >= 50) return { label: 'Avi', color: 'text-yellow-500 bg-yellow-500/20', description: 'בינוני - צריך תוכנית פעולה' };
    return { label: 'Green', color: 'text-green-500 bg-green-500/20', description: 'נמוך - מצב יציב' };
  };

  const calculateDebtRiskScore = (debt: Partial<Debt>) => {
    let score = 0;
    if (debt.amount && debt.amount > 100000) score += 30;
    else if (debt.amount && debt.amount > 50000) score += 20;
    else if (debt.amount) score += 10;

    if (debt.enforcementDate) score += 40;
    if (debt.paymentStatus === 'defaulted') score += 30;
    else if (debt.paymentStatus === 'late') score += 15;

    if (debt.interestRate && debt.interestRate > 15) score += 20;
    else if (debt.interestRate) score += 10;

    return Math.min(score, 100);
  };

  const addDebt = () => {
    if (!currentDebt.category || !currentDebt.amount || !currentDebt.creditorName) {
      toast.error('אנא מלא את כל השדות החובה');
      return;
    }

    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      category: currentDebt.category || '',
      amount: currentDebt.amount || 0,
      riskScore: calculateDebtRiskScore(currentDebt),
      creditorName: currentDebt.creditorName || '',
      caseNumber: currentDebt.caseNumber || '',
      interestRate: currentDebt.interestRate || 0,
      enforcementDate: currentDebt.enforcementDate || '',
      debtStartDate: currentDebt.debtStartDate || '',
      paymentStatus: currentDebt.paymentStatus || 'current',
      monthlyPayment: currentDebt.monthlyPayment || 0,
    };

    setFormData(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt],
      totalAmount: prev.totalAmount + (currentDebt.amount || 0),
    }));

    setCurrentDebt({
      category: '',
      amount: 0,
      riskScore: 0,
      creditorName: '',
      caseNumber: '',
      interestRate: 0,
      enforcementDate: '',
      debtStartDate: '',
      paymentStatus: 'current',
      monthlyPayment: 0,
    });

    toast.success('חוב נוסף בהצלחה');
  };

  const removeDebt = (id: string) => {
    const debt = formData.debts.find(d => d.id === id);
    if (debt) {
      setFormData(prev => ({
        ...prev,
        debts: prev.debts.filter(d => d.id !== id),
        totalAmount: prev.totalAmount - debt.amount,
      }));
    }
  };

  const calculateTotalRisk = () => {
    const debtRatio = formData.totalAmount / Math.max(formData.monthlyIncome, 1);
    let score = 0;

    // Debt to income ratio (0-50)
    if (debtRatio > 10) score += 50;
    else if (debtRatio > 5) score += 40;
    else if (debtRatio > 2) score += 30;
    else if (debtRatio > 1) score += 20;
    else score += 10;

    // Enforcement status (0-30)
    if (formData.hasEnforcement) score += 30;

    // Warning letters (0-20)
    if (formData.hasWarningLetters) score += 20;

    // Number of creditors (0-20)
    const creditorScore = Math.min(formData.debts.length * 3, 20);
    score += creditorScore;

    // Previous negotiations (0-20)
    if (formData.previousNegotiations) score += 10;

    // Legal help needed (0-20)
    if (formData.needsLegalHelp) score += 20;

    return Math.min(score, 200);
  };

  const handleNext = () => {
    if (step === 1 && formData.debts.length === 0) {
      toast.error('אנא הוסף לפחות חוב אחד');
      return;
    }
    if (step === 3) {
      const totalRisk = calculateTotalRisk();
      setFormData(prev => ({ ...prev, totalRisk }));
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const totalRisk = calculateTotalRisk();
      const riskLevelObj = getRiskLevel(totalRisk);
      const availableForDebt = Math.max(0, formData.monthlyIncome - formData.monthlyExpenses);

      await saveMutation.mutateAsync({
        riskScore: totalRisk,
        riskLevel: riskLevelObj.label,
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

  const riskLevel = getRiskLevel(formData.totalRisk);

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
              {step === 1 && 'הוסף חובות'}
              {step === 2 && 'מצב כלכלי'}
              {step === 3 && 'מידע נוסף'}
              {step === 4 && 'סיכום וביקורת'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Add Debts */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Debt Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">סוג חוב</label>
                    <select
                      value={currentDebt.category || ''}
                      onChange={(e) => setCurrentDebt({ ...currentDebt, category: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">בחר סוג חוב</option>
                      {DEBT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">סכום חוב (₪)</label>
                      <input
                        type="number"
                        value={currentDebt.amount || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">שם הנושה</label>
                      <input
                        type="text"
                        value={currentDebt.creditorName || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, creditorName: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="שם הנושה"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">מספר תיק</label>
                      <input
                        type="text"
                        value={currentDebt.caseNumber || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, caseNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="מספר תיק"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">ריביות (%)</label>
                      <input
                        type="number"
                        value={currentDebt.interestRate || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, interestRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">תאריך התחלת החוב</label>
                      <input
                        type="date"
                        value={currentDebt.debtStartDate || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, debtStartDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">תאריך הוצל"פ (אם קיים)</label>
                      <input
                        type="date"
                        value={currentDebt.enforcementDate || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, enforcementDate: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">מצב תשלומים</label>
                      <select
                        value={currentDebt.paymentStatus || 'current'}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, paymentStatus: e.target.value as any })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="current">עדכני</option>
                        <option value="late">בעיכוב</option>
                        <option value="defaulted">בחדלות</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">תשלום חודשי (₪)</label>
                      <input
                        type="number"
                        value={currentDebt.monthlyPayment || ''}
                        onChange={(e) => setCurrentDebt({ ...currentDebt, monthlyPayment: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <Button onClick={addDebt} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    הוסף חוב
                  </Button>
                </div>

                {/* Debts List */}
                {formData.debts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">חובות שנוספו ({formData.debts.length})</h3>
                    {formData.debts.map((debt) => (
                      <div key={debt.id} className="bg-slate-700/50 p-4 rounded flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white">
                            {DEBT_TYPES.find((t) => t.value === debt.category)?.label} - {debt.creditorName}
                          </p>
                          <p className="text-slate-400 text-sm">₪{debt.amount.toLocaleString('he-IL')}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDebt(debt.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          מחק
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Financial Situation */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">הכנסה חודשית (₪)</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">הוצאות חודשיות (₪)</label>
                  <input
                    type="number"
                    value={formData.monthlyExpenses || ''}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="bg-slate-700/50 p-4 rounded">
                  <p className="text-slate-300">זמין לחוב חודשי:</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₪{Math.max(0, formData.monthlyIncome - formData.monthlyExpenses).toLocaleString('he-IL')}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Additional Information */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasEnforcement}
                      onChange={(e) => setFormData({ ...formData, hasEnforcement: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">יש הוצל"פ פעיל</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasWarningLetters}
                      onChange={(e) => setFormData({ ...formData, hasWarningLetters: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">יש מכתבי התראה</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.previousNegotiations}
                      onChange={(e) => setFormData({ ...formData, previousNegotiations: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">ניסיונות משא ומתן קודמים עם נושים</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.needsLegalHelp}
                      onChange={(e) => setFormData({ ...formData, needsLegalHelp: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-300">צריך עזרה משפטית</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-6">
                {/* Risk Level */}
                <div className={`p-6 rounded-lg ${riskLevel.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold">{riskLevel.label}</h3>
                    <span className="text-3xl font-bold">{formData.totalRisk}/200</span>
                  </div>
                  <p className="text-sm">{riskLevel.description}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">סה"כ חוב</p>
                    <p className="text-2xl font-bold text-white">₪{formData.totalAmount.toLocaleString('he-IL')}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">מספר נושים</p>
                    <p className="text-2xl font-bold text-white">{formData.debts.length}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">הכנסה חודשית</p>
                    <p className="text-2xl font-bold text-white">₪{formData.monthlyIncome.toLocaleString('he-IL')}</p>
                  </div>
                  <div className="bg-slate-700/50 p-4 rounded">
                    <p className="text-slate-400 text-sm">זמין לחוב</p>
                    <p className="text-2xl font-bold text-green-400">
                      ₪{Math.max(0, formData.monthlyIncome - formData.monthlyExpenses).toLocaleString('he-IL')}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 flex-wrap">
                  {formData.hasEnforcement && (
                    <div className="bg-red-500/20 text-red-300 px-3 py-1 rounded text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      הוצל"פ פעיל
                    </div>
                  )}
                  {formData.hasWarningLetters && (
                    <div className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      מכתבי התראה
                    </div>
                  )}
                  {formData.previousNegotiations && (
                    <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      משא ומתן קודם
                    </div>
                  )}
                  {formData.needsLegalHelp && (
                    <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      צריך עזרה משפטית
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="bg-slate-700/50 p-4 rounded space-y-3">
                  <h4 className="font-semibold text-white">המלצות:</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    {riskLevel.label === 'Yossi' && (
                      <>
                        <li>• בקש ייעוץ משפטי מיידי</li>
                        <li>• התחל משא ומתן עם נושים</li>
                        <li>• שקול פתרונות משפטיים (פשיטת רגל, הסדר)</li>
                      </>
                    )}
                    {riskLevel.label === 'Dana' && (
                      <>
                        <li>• בקש ייעוץ כלכלי</li>
                        <li>• צור תוכנית פירעון</li>
                        <li>• התחל משא ומתן עם נושים</li>
                      </>
                    )}
                    {riskLevel.label === 'Avi' && (
                      <>
                        <li>• צור תוכנית פעולה</li>
                        <li>• הקטן הוצאות</li>
                        <li>• הגדל הכנסה</li>
                      </>
                    )}
                    {riskLevel.label === 'Green' && (
                      <>
                        <li>• המשך בתשלומים הנוכחיים</li>
                        <li>• בנה קרן חירום</li>
                        <li>• שמור על מצב כלכלי יציב</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
            disabled={step === 1}
          >
            חזור
          </Button>
          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              הבא
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saveMutation.isPending ? 'שומר...' : 'סיים אבחון'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
