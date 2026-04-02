import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Plus, Trash2, ChevronRight, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { trpc } from '@/lib/trpc';

interface Debt {
  id: string;
  category: string;
  amount: number;
  monthsLate: number;
  legalStatus: string;
}

const DEBT_CATEGORIES = [
  { value: 'credit_card', label: 'כרטיס אשראי' },
  { value: 'bank_loan', label: 'הלוואה מבנק' },
  { value: 'tax_debt', label: 'חוב מס' },
  { value: 'municipal_debt', label: 'חוב עירוני' },
  { value: 'utility_debt', label: 'חוב חשמל/מים' },
  { value: 'medical_debt', label: 'חוב רפואי' },
  { value: 'private_loan', label: 'הלוואה פרטית' },
  { value: 'other', label: 'אחר' },
];

const LEGAL_STATUSES = [
  { value: 'overdue', label: 'בפיגור' },
  { value: 'demand_letter', label: 'דרישה משפטית' },
  { value: 'lawsuit', label: 'תביעה משפטית' },
  { value: 'enforcement', label: 'הוצאה לפועל' },
  { value: 'levy', label: 'עיקול' },
  { value: 'insolvency', label: 'הליך פשיטת רגל' },
];

export default function DebtForm() {
  const [, setLocation] = useLocation();
  const [debts, setDebts] = useState<Debt[]>([
    { id: '1', category: 'credit_card', amount: 30000, monthsLate: 3, legalStatus: 'overdue' },
  ]);
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(8000);
  const [creditorCount, setCreditorCount] = useState(3);
  const [hasEnforcement, setHasEnforcement] = useState(false);
  const [hasWarningLetters, setHasWarningLetters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performDiagnosisMutation = trpc.diagnosis.performDiagnosis.useMutation();

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      category: 'credit_card',
      amount: 0,
      monthsLate: 0,
      legalStatus: 'overdue',
    };
    setDebts([...debts, newDebt]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof Debt, value: any) => {
    setDebts(debts.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (debts.length === 0) {
        throw new Error('יש להוסיף לפחות חוב אחד');
      }

      if (monthlyIncome <= 0) {
        throw new Error('הכנסה חודשית חייבת להיות גדולה מ-0');
      }

      if (debts.some(d => d.amount <= 0)) {
        throw new Error('סכום החוב חייב להיות גדול מ-0');
      }

      // Call diagnosis mutation
      const result = await performDiagnosisMutation.mutateAsync({
        debts: debts.map(d => ({
          category: d.category,
          amount: d.amount,
          monthsLate: d.monthsLate,
          legalStatus: d.legalStatus,
        })),
        monthlyIncome,
        monthlyExpenses,
        creditorCount,
        hasEnforcement,
        hasWarningLetters,
      });

      if (result.success && result.diagnosis) {
        // Save to session storage for results page
        sessionStorage.setItem('diagnosisResult', JSON.stringify(result.diagnosis));
        // Navigate to results
        setLocation('/diagnosis-results');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בביצוע האבחון');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const monthlyAvailable = monthlyIncome - monthlyExpenses;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">טופס אבחון חוב</h1>
          <p className="text-gray-600 mt-2">מלא את הטופס בפרטים המלאים של מצב החוב שלך</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Debts Section */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">החובות שלך</h2>
              <Button type="button" variant="outline" size="sm" onClick={addDebt}>
                <Plus className="w-4 h-4 ml-2" />
                הוסף חוב
              </Button>
            </div>

            <div className="space-y-4">
              {debts.map((debt, idx) => (
                <div key={debt.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold">חוב #{idx + 1}</h3>
                    {debts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDebt(debt.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        סוג חוב
                      </label>
                      <select
                        value={debt.category}
                        onChange={e => updateDebt(debt.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {DEBT_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        סכום החוב (₪)
                      </label>
                      <input
                        type="number"
                        value={debt.amount}
                        onChange={e => updateDebt(debt.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* Months Late */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        חודשים בפיגור
                      </label>
                      <input
                        type="number"
                        value={debt.monthsLate}
                        onChange={e => updateDebt(debt.id, 'monthsLate', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    {/* Legal Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        סטטוס משפטי
                      </label>
                      <select
                        value={debt.legalStatus}
                        onChange={e => updateDebt(debt.id, 'legalStatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {LEGAL_STATUSES.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">סה"כ חובות</p>
                  <p className="text-2xl font-bold">₪{totalDebt.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">מספר חובות</p>
                  <p className="text-2xl font-bold">{debts.length}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">מידע פיננסי</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הכנסה חודשית (₪)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Monthly Expenses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  הוצאות חודשיות (₪)
                </label>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={e => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Creditor Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  מספר נושים
                </label>
                <input
                  type="number"
                  value={creditorCount}
                  onChange={e => setCreditorCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">זמין לתשלום חובות</p>
                  <p className={`text-2xl font-bold ${monthlyAvailable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₪{monthlyAvailable.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">יחס חוב להכנסה</p>
                  <p className="text-2xl font-bold">
                    {monthlyIncome > 0 ? ((totalDebt / (monthlyIncome * 12)).toFixed(1)) : '0'}x
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Legal Status Checkboxes */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">סטטוס משפטי כללי</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEnforcement}
                  onChange={e => setHasEnforcement(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">יש הוצאה לפועל פעילה</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWarningLetters}
                  onChange={e => setHasWarningLetters(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-gray-700">יש הודעות משפטיות</span>
              </label>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setLocation('/dashboard')}
              disabled={isLoading}
            >
              ביטול
            </Button>
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? 'מעבדים...' : 'בצע אבחון'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
