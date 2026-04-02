import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { getCategoriesArray, getSubcategoriesForCategory, LEGAL_STATUS_OPTIONS } from '../../../shared/debt-categories';
import { useLocation } from 'wouter';

interface DebtInput {
  id: string;
  category: string;
  subcategory: string;
  entity: string;
  amount: string;
  months_late: string;
  legal_status: string;
  case_number: string;
  notes: string;
}

export default function MultiDebtDiagnosis() {
  const [, setLocation] = useLocation();
  const [debts, setDebts] = useState<DebtInput[]>([
    {
      id: '1',
      category: '',
      subcategory: '',
      entity: '',
      amount: '',
      months_late: '',
      legal_status: 'overdue',
      case_number: '',
      notes: '',
    },
  ]);

  const [step, setStep] = useState(1); // 1: Add debts, 2: Review, 3: Results
  const [hasStableIncome, setHasStableIncome] = useState(true);
  const [hasAssetAtRisk, setHasAssetAtRisk] = useState(false);

  const addDebt = () => {
    const newDebt: DebtInput = {
      id: String(debts.length + 1),
      category: '',
      subcategory: '',
      entity: '',
      amount: '',
      months_late: '',
      legal_status: 'overdue',
      case_number: '',
      notes: '',
    };
    setDebts([...debts, newDebt]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const updateDebt = (id: string, field: keyof DebtInput, value: string) => {
    setDebts(debts.map(d => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const isDebtComplete = (debt: DebtInput) => {
    return debt.category && debt.subcategory && debt.entity && debt.amount && debt.months_late;
  };

  const allDebtsComplete = debts.every(isDebtComplete);

  const handleCalculate = () => {
    if (!allDebtsComplete) {
      alert('אנא מלא את כל השדות הנדרשים');
      return;
    }
    // TODO: Call API to calculate diagnosis
    setStep(3);
  };

  const categories = getCategoriesArray() as any[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">אבחון חובות מרובים</h1>
          <p className="text-slate-300">הוסף את כל החובות שלך וקבל אבחון מלא עם המלצות</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Debts List */}
            {debts.map((debt, index) => (
              <Card key={debt.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">חוב #{index + 1}</CardTitle>
                    {debts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDebt(debt.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">קטגוריה *</label>
                    <Select value={debt.category} onValueChange={v => updateDebt(debt.id, 'category', v)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="בחר קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subcategory */}
                  {debt.category && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">תת-קטגוריה *</label>
                      <Select value={debt.subcategory} onValueChange={v => updateDebt(debt.id, 'subcategory', v)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="בחר תת-קטגוריה" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSubcategoriesForCategory(debt.category as any).map((sub: any) => (
                            <SelectItem key={sub.value} value={sub.value}>
                              {sub.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Entity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">גוף / חברה *</label>
                    <Input
                      placeholder="לדוגמה: בנק לאומי"
                      value={debt.entity}
                      onChange={e => updateDebt(debt.id, 'entity', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">סכום החוב (₪) *</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={debt.amount}
                      onChange={e => updateDebt(debt.id, 'amount', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Months Late */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">חודשים בפיגור *</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={debt.months_late}
                      onChange={e => updateDebt(debt.id, 'months_late', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Legal Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">מצב משפטי</label>
                    <Select value={debt.legal_status} onValueChange={v => updateDebt(debt.id, 'legal_status', v)}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGAL_STATUS_OPTIONS.map((status: any) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Case Number */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">מספר תיק (אם קיים)</label>
                    <Input
                      placeholder="לדוגמה: 12345"
                      value={debt.case_number}
                      onChange={e => updateDebt(debt.id, 'case_number', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">הערות</label>
                    <Textarea
                      placeholder="הוסף הערות נוספות..."
                      value={debt.notes}
                      onChange={e => updateDebt(debt.id, 'notes', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Debt Button */}
            {debts.length < 10 && (
              <Button
                onClick={addDebt}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                הוסף חוב נוסף
              </Button>
            )}

            {/* Additional Factors */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">גורמים נוספים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="stable_income"
                    checked={hasStableIncome}
                    onChange={e => setHasStableIncome(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="stable_income" className="text-slate-300">
                    יש לי הכנסה יציבה
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="asset_at_risk"
                    checked={hasAssetAtRisk}
                    onChange={e => setHasAssetAtRisk(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="asset_at_risk" className="text-slate-300">
                    יש לי נכס בסיכון (דירה, רכב וכו')
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleCalculate}
                disabled={!allDebtsComplete}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Calculator className="w-4 h-4 mr-2" />
                חשב אבחון
              </Button>
              <Button
                onClick={() => setLocation('/')}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300"
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center text-white">
            <p className="text-xl">תוצאות האבחון יופיעו כאן...</p>
          </div>
        )}
      </div>
    </div>
  );
}
