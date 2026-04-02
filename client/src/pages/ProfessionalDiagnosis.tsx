import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'wouter';

const DEBT_CATEGORIES = [
  { id: 'credit_card', label: 'כרטיס אשראי', icon: '💳' },
  { id: 'bank_loan', label: 'הלוואת בנק', icon: '🏦' },
  { id: 'tax_debt', label: 'חוב מס', icon: '📋' },
  { id: 'municipal', label: 'חוב עירוני', icon: '🏛️' },
  { id: 'private_loan', label: 'הלוואה פרטית', icon: '👤' },
  { id: 'other', label: 'אחר', icon: '📌' },
];

const LEGAL_STATUS_OPTIONS = [
  { id: 'overdue', label: 'חוב בפיגור' },
  { id: 'demand_letter', label: 'הודעה דורשת' },
  { id: 'lawsuit', label: 'תביעה משפטית' },
  { id: 'enforcement', label: 'הוצאה לפועל' },
  { id: 'levy', label: 'עיקול' },
  { id: 'insolvency', label: 'פשיטת רגל' },
];

interface Debt {
  id: string;
  category: string;
  amount: number;
  monthsLate: number;
  legalStatus: string;
}

export default function ProfessionalDiagnosis() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [hasEnforcement, setHasEnforcement] = useState(false);
  const [hasWarningLetters, setHasWarningLetters] = useState(false);
  const [currentDebt, setCurrentDebt] = useState<Partial<Debt>>({
    category: '',
    amount: 0,
    monthsLate: 0,
    legalStatus: 'overdue',
  });
  const [isLoading, setIsLoading] = useState(false);

  const performDiagnosisMutation = trpc.diagnosis.performDiagnosis.useMutation({
    onSuccess: (data) => {
      toast.success('אבחון הושלם בהצלחה!');
      // Navigate to results page
      setLocation('/diagnosis-results');
    },
    onError: (error: any) => {
      toast.error(`שגיאה: ${error.message}`);
      setIsLoading(false);
    },
  });

  const handleAddDebt = () => {
    if (!currentDebt.category || !currentDebt.amount) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    const newDebt: Debt = {
      id: Date.now().toString(),
      category: currentDebt.category || '',
      amount: currentDebt.amount || 0,
      monthsLate: currentDebt.monthsLate || 0,
      legalStatus: currentDebt.legalStatus || 'overdue',
    };

    setDebts([...debts, newDebt]);
    setCurrentDebt({
      category: '',
      amount: 0,
      monthsLate: 0,
      legalStatus: 'overdue',
    });
    toast.success('חוב נוסף בהצלחה');
  };

  const handleRemoveDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleNext = () => {
    if (step === 2 && debts.length === 0) {
      toast.error('אנא הוסף לפחות חוב אחד');
      return;
    }
    if (step === 3 && monthlyIncome === 0) {
      toast.error('אנא הזן הכנסה חודשית');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (debts.length === 0) {
      toast.error('אנא הוסף לפחות חוב אחד');
      return;
    }

    setIsLoading(true);
    try {
      await performDiagnosisMutation.mutateAsync({
        debts,
        monthlyIncome,
        monthlyExpenses,
        creditorCount: debts.length,
        hasEnforcement,
        hasWarningLetters,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const monthlyAvailable = Math.max(0, monthlyIncome - monthlyExpenses);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">אבחון מקצועי</h1>
          <p className="text-slate-400">שלב {step} מתוך 4 - {step === 1 ? 'הוסף חובות' : step === 2 ? 'פרטי חובות' : step === 3 ? 'מידע פיננסי' : 'סיכום וביקורת'}</p>
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
              {step === 1 && '🏷️ בחר סוג חוב'}
              {step === 2 && '💰 פרטי החובות'}
              {step === 3 && '📊 מידע פיננסי'}
              {step === 4 && '✅ סיכום וביקורת'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Add Debt */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <p className="text-slate-300 mb-4">בחר סוג חוב להוספה:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DEBT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCurrentDebt({ ...currentDebt, category: cat.id });
                          setStep(2);
                        }}
                        className="p-3 bg-slate-600 hover:bg-blue-600 rounded-lg text-white transition text-sm"
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {debts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">חובות שנוספו:</p>
                    {debts.map(debt => (
                      <div key={debt.id} className="flex justify-between items-center p-2 bg-slate-700 rounded">
                        <span className="text-white">
                          {DEBT_CATEGORIES.find(c => c.id === debt.category)?.label} - ₪{debt.amount}
                        </span>
                        <button
                          onClick={() => handleRemoveDebt(debt.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Debt Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">סוג חוב:</label>
                  <p className="text-white font-semibold">
                    {DEBT_CATEGORIES.find(c => c.id === currentDebt.category)?.label}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">סכום החוב:</label>
                  <input
                    type="number"
                    value={currentDebt.amount || ''}
                    onChange={(e) => setCurrentDebt({ ...currentDebt, amount: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="הקלד סכום"
                  />
                  {currentDebt.amount && (
                    <p className="text-blue-400 mt-1">₪{currentDebt.amount.toLocaleString('he-IL')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">חודשים בפיגור:</label>
                  <input
                    type="number"
                    value={currentDebt.monthsLate || ''}
                    onChange={(e) => setCurrentDebt({ ...currentDebt, monthsLate: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="מספר חודשים"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">מצב משפטי:</label>
                  <select
                    value={currentDebt.legalStatus || 'overdue'}
                    onChange={(e) => setCurrentDebt({ ...currentDebt, legalStatus: e.target.value })}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                  >
                    {LEGAL_STATUS_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddDebt}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    ✓ הוסף חוב
                  </Button>
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    ← חזור
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Financial Info */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2">הכנסה חודשית:</label>
                  <input
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="הכנסה חודשית"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2">הוצאות חודשיות:</label>
                  <input
                    type="number"
                    value={monthlyExpenses || ''}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                    placeholder="הוצאות חודשיות"
                  />
                </div>

                <div className="bg-slate-700 p-3 rounded">
                  <p className="text-slate-300">זמין לתשלום חובות:</p>
                  <p className="text-green-400 text-xl font-bold">₪{monthlyAvailable.toLocaleString('he-IL')}</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEnforcement}
                      onChange={(e) => setHasEnforcement(e.target.checked)}
                      className="w-4 h-4"
                    />
                    יש הוצאה לפועל
                  </label>
                  <label className="flex items-center gap-2 text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWarningLetters}
                      onChange={(e) => setHasWarningLetters(e.target.checked)}
                      className="w-4 h-4"
                    />
                    יש הודעות משפטיות
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-300">סה"כ חובות:</span>
                    <span className="text-white font-bold">₪{totalDebt.toLocaleString('he-IL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">מספר חובות:</span>
                    <span className="text-white font-bold">{debts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">הכנסה חודשית:</span>
                    <span className="text-white font-bold">₪{monthlyIncome.toLocaleString('he-IL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">זמין לתשלום:</span>
                    <span className="text-green-400 font-bold">₪{monthlyAvailable.toLocaleString('he-IL')}</span>
                  </div>
                </div>

                {hasEnforcement && (
                  <div className="bg-red-900 border border-red-700 p-3 rounded-lg flex gap-2">
                    <AlertCircle className="text-red-400 flex-shrink-0" />
                    <p className="text-red-200 text-sm">יש הוצאה לפועל - דרוש טיפול דחוף</p>
                  </div>
                )}

                {monthlyAvailable <= 0 && (
                  <div className="bg-orange-900 border border-orange-700 p-3 rounded-lg flex gap-2">
                    <AlertCircle className="text-orange-400 flex-shrink-0" />
                    <p className="text-orange-200 text-sm">אין כסף זמין לתשלום - דרוש סידור משפטי</p>
                  </div>
                )}

                {monthlyAvailable > 0 && (
                  <div className="bg-green-900 border border-green-700 p-3 rounded-lg flex gap-2">
                    <CheckCircle className="text-green-400 flex-shrink-0" />
                    <p className="text-green-200 text-sm">יש יכולת תשלום - אפשר לתכנן סידור</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <Button
            onClick={handleBack}
            variant="outline"
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            חזור
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              הבא
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'מעבד...' : '✓ סיים אבחון'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
