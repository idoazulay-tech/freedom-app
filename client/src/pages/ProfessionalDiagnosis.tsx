'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Trash2, Edit2, X, ChevronDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { CREDITORS_BY_CATEGORY } from '@shared/creditors';

interface Debt {
  id: string;
  category: string;
  amount: number;
  creditorName: string;
  certainty: 'known' | 'estimated' | 'unknown';
  urgency: 'immediate' | 'medium' | 'low';
  interest: number;
  startDate: string;
  paymentStatus: 'current' | 'delayed' | 'default' | 'enforcement';
}

interface FormData {
  // Step 1: Identity
  fullName: string;
  phone: string;
  email: string;
  maritalStatus: string;
  dependents: number;
  
  // Step 2: Financial
  monthlyIncome: number;
  incomeStability: string;
  expensesMode: 'total' | 'detailed';
  totalExpenses: number;
  expenses: Record<string, number>;
  
  // Step 3: Debts
  debts: Debt[];
  
  // Step 4: Additional
  hasEnforcement: boolean;
  hasLetters: boolean;
  hasNegotiation: boolean;
  hasLawyer: boolean;
  
  // Step 5: Results
  totalRisk: number;
  persona: string;
}

const EXPENSE_CATEGORIES = [
  'דיור', 'חשמל', 'מים', 'גז', 'אינטרנט', 'טלפון',
  'מזון', 'תחבורה', 'בנזין', 'ביטוח רכב', 'טיפול רפואי',
  'תרופות', 'ביטוח בריאות', 'חינוך', 'בגדים', 'ניקיון',
  'טיפול אישי', 'בידור', 'ספרים', 'חברות ספורט', 'מסעדות',
  'קפה', 'חיות מחמד', 'טיפול חיות', 'תחזוקה בית', 'רהיטים',
  'כלים', 'ביגוד ילדים', 'צעצועים', 'טיולים', 'מתנות',
  'חגים', 'חיסכון', 'השקעות', 'פנסיה', 'אחר'
];

export default function ProfessionalDiagnosis() {
  const [location, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Validation function
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'fullName':
        return !value?.trim() ? 'שם מלא הוא שדה חובה' : '';
      case 'phone':
        return !value?.trim() ? 'מספר טלפון הוא שדה חובה' : '';
      case 'email':
        return !value?.trim() ? 'אימייל הוא שדה חובה' : !value.includes('@') ? 'אימייל לא תקין' : '';
      case 'monthlyIncome':
        return value <= 0 ? 'הכנסה חודשית חייבת להיות גדולה מ-0' : '';
      case 'category':
        return !value ? 'סוג החוב הוא שדה חובה' : '';
      case 'creditorName':
        return !value ? 'שם הנושה הוא שדה חובה' : '';
      case 'amount':
        return value <= 0 ? 'סכום החוב חייב להיות גדול מ-0' : '';
      default:
        return '';
    }
  };
  
  // Mutation for saving diagnosis
  const saveDiagnosisMutation = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success('האבחון נשמר בהצלחה!');
      navigate('/profile');
    },
    onError: (error) => {
      toast.error(`שגיאה בשמירה: ${error.message}`);
      setIsSaving(false);
    },
  });

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    maritalStatus: '',
    dependents: 0,
    monthlyIncome: 0,
    incomeStability: '',
    expensesMode: 'total',
    totalExpenses: 0,
    expenses: {},
    debts: [],
    hasEnforcement: false,
    hasLetters: false,
    hasNegotiation: false,
    hasLawyer: false,
    totalRisk: 0,
    persona: '',
  });

  const [currentDebt, setCurrentDebt] = useState<Partial<Debt>>({
    category: '',
    amount: 0,
    creditorName: '',
    certainty: 'known',
    urgency: 'medium',
    interest: 0,
    startDate: '',
    paymentStatus: 'current',
  });

  // Step handlers
  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddDebt = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentDebt.category || !currentDebt.amount || !currentDebt.creditorName) {
      toast.error('אנא מלא את כל השדות החובה');
      return;
    }

    if (editingDebtId) {
      // Update existing debt
      setFormData(prev => ({
        ...prev,
        debts: prev.debts.map(d => 
          d.id === editingDebtId 
            ? {
                ...d,
                category: currentDebt.category || '',
                amount: currentDebt.amount || 0,
                creditorName: currentDebt.creditorName || '',
                certainty: currentDebt.certainty || 'known',
                urgency: currentDebt.urgency || 'medium',
                interest: currentDebt.interest || 0,
                startDate: currentDebt.startDate || '',
                paymentStatus: currentDebt.paymentStatus || 'current',
              }
            : d
        )
      }));
      setEditingDebtId(null);
      toast.success('חוב עודכן בהצלחה!');
    } else {
      // Add new debt
      const newDebt: Debt = {
        id: Date.now().toString(),
        category: currentDebt.category || '',
        amount: currentDebt.amount || 0,
        creditorName: currentDebt.creditorName || '',
        certainty: currentDebt.certainty || 'known',
        urgency: currentDebt.urgency || 'medium',
        interest: currentDebt.interest || 0,
        startDate: currentDebt.startDate || '',
        paymentStatus: currentDebt.paymentStatus || 'current',
      };

      setFormData(prev => ({
        ...prev,
        debts: [...prev.debts, newDebt]
      }));
      toast.success('חוב נוסף בהצלחה!');
    }

    setCurrentDebt({
      category: '',
      amount: 0,
      creditorName: '',
      certainty: 'known',
      urgency: 'medium',
      interest: 0,
      startDate: '',
      paymentStatus: 'current',
    });
  };

  const handleEditDebt = (debt: Debt) => {
    setCurrentDebt(debt);
    setEditingDebtId(debt.id);
  };

  const handleRemoveDebt = (id: string) => {
    setFormData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
    if (editingDebtId === id) {
      setEditingDebtId(null);
      setCurrentDebt({
        category: '',
        amount: 0,
        creditorName: '',
        certainty: 'known',
        urgency: 'medium',
        interest: 0,
        startDate: '',
        paymentStatus: 'current',
      });
    }
  };

  const handleClearDebtForm = () => {
    setCurrentDebt({
      category: '',
      amount: 0,
      creditorName: '',
      certainty: 'known',
      urgency: 'medium',
      interest: 0,
      startDate: '',
      paymentStatus: 'current',
    });
    setEditingDebtId(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('אנא הזן שם מלא');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('אנא הזן מספר טלפון');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('אנא הזן כתובת אימייל');
      return;
    }
    if (formData.monthlyIncome <= 0) {
      toast.error('אנא הזן הכנסה חדשית');
      return;
    }
    if (formData.debts.length === 0) {
      toast.error('אנא הוסף לפחות חוב אחד');
      return;
    }

    const totalRisk = calculateTotalRisk();
    const persona = getPersona(totalRisk);
    
    setIsSaving(true);
    
    try {
      // Save to database
      await saveDiagnosisMutation.mutateAsync({
        riskScore: totalRisk,
        riskLevel: persona,
        totalDebt: formData.debts.reduce((sum, d) => sum + d.amount, 0),
        monthlyIncome: formData.monthlyIncome,
        monthlyExpenses: formData.expensesMode === 'total' 
          ? formData.totalExpenses 
          : calculateTotalExpensesFromDetailed(),
        availableForDebt: Math.max(0, formData.monthlyIncome - (formData.expensesMode === 'total' ? formData.totalExpenses : calculateTotalExpensesFromDetailed())),
        creditorCount: formData.debts.length,
        hasEnforcement: formData.hasEnforcement,
        hasWarningLetters: formData.hasLetters,
        debtsData: JSON.stringify(formData.debts),
        actionsData: JSON.stringify({
          hasEnforcement: formData.hasEnforcement,
          hasLetters: formData.hasLetters,
          hasNegotiation: formData.hasNegotiation,
          hasLawyer: formData.hasLawyer,
        }),
      });
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      setIsSaving(false);
    }
  };

  // Calculate total expenses from detailed mode
  const calculateTotalExpensesFromDetailed = (): number => {
    return Object.values(formData.expenses).reduce((sum, val) => sum + (val || 0), 0);
  };

  const calculateTotalRisk = (): number => {
    let risk = 0;
    
    // Financial layer (0-150)
    const totalExpenses = formData.expensesMode === 'total' 
      ? formData.totalExpenses 
      : calculateTotalExpensesFromDetailed();
    
    const debtToIncome = formData.monthlyIncome > 0 
      ? (formData.debts.reduce((sum, d) => sum + d.amount, 0) / formData.monthlyIncome) 
      : 100;
    risk += Math.min(150, debtToIncome * 50);
    
    // Legal layer (0-150)
    if (formData.hasEnforcement) risk += 80;
    if (formData.hasLetters) risk += 40;
    if (formData.hasNegotiation) risk += 20;
    
    // Cash flow layer (0-100)
    risk += Math.min(100, formData.debts.length * 15);
    
    return Math.min(400, Math.max(0, risk));
  };

  const getPersona = (risk: number): string => {
    if (risk < 100) return 'Green';
    if (risk < 180) return 'Avi';
    if (risk < 280) return 'Dana';
    return 'Yossi';
  };

  const getPersonaColor = (persona: string): string => {
    switch (persona) {
      case 'Green': return 'bg-green-600';
      case 'Avi': return 'bg-blue-600';
      case 'Dana': return 'bg-yellow-600';
      case 'Yossi': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskLevel = (risk: number): string => {
    if (risk < 100) return 'נמוך';
    if (risk < 180) return 'בינוני';
    if (risk < 280) return 'גבוה';
    return 'קריטי';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-white text-sm">שלב {step} מתוך 5</span>
            <span className="text-slate-400 text-sm">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">זהות</h2>
            <div>
              <label className="block text-slate-300 text-sm mb-2">שם מלא *</label>
              <input
                type="text"
                placeholder="לדוגמה: דוד כהן"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({...formData, fullName: e.target.value});
                  const error = validateField('fullName', e.target.value);
                  setErrors(prev => ({ ...prev, fullName: error }));
                }}
                className={`w-full bg-slate-700 text-white p-3 rounded border outline-none ${
                  errors.fullName ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">טלפון *</label>
              <input
                type="tel"
                placeholder="050-1234567"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({...formData, phone: e.target.value});
                  const error = validateField('phone', e.target.value);
                  setErrors(prev => ({ ...prev, phone: error }));
                }}
                className={`w-full bg-slate-700 text-white p-3 rounded border outline-none ${
                  errors.phone ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">אימייל *</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  const error = validateField('email', e.target.value);
                  setErrors(prev => ({ ...prev, email: error }));
                }}
                className={`w-full bg-slate-700 text-white p-3 rounded border outline-none ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">מצב משפחתי</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">בחר מצב משפחתי</option>
                <option value="single">רווק/ה</option>
                <option value="married">נשוי/ה</option>
                <option value="divorced">גרוש/ה</option>
                <option value="widowed">אלמן/ה</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">מספר בני משפחה</label>
              <input
                type="number"
                min="0"
                value={formData.dependents}
                onChange={(e) => setFormData({...formData, dependents: parseInt(e.target.value) || 0})}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Financial */}
        {step === 2 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">מצב כלכלי</h2>
            
            <div>
              <label className="block text-slate-300 text-sm mb-2">הכנסה חדשית *</label>
              <input
                type="number"
                min="0"
                value={formData.monthlyIncome}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFormData({...formData, monthlyIncome: value});
                  const error = validateField('monthlyIncome', value);
                  setErrors(prev => ({ ...prev, monthlyIncome: error }));
                }}
                className={`w-full bg-slate-700 text-white p-3 rounded border outline-none ${
                  errors.monthlyIncome ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
                placeholder="לדוגמה: 10000"
              />
              {errors.monthlyIncome && <p className="text-red-400 text-xs mt-1">{errors.monthlyIncome}</p>}
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">יציבות הכנסה</label>
              <select
                value={formData.incomeStability}
                onChange={(e) => setFormData({...formData, incomeStability: e.target.value})}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">בחר יציבות</option>
                <option value="stable">יציבה</option>
                <option value="moderate">בינונית</option>
                <option value="unstable">לא יציבה</option>
              </select>
            </div>

            {/* Smart Expenses Toggle */}
            <div className="border-t border-slate-600 pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-semibold">אופן הזנת הוצאות</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({...formData, expensesMode: 'total'})}
                    className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      formData.expensesMode === 'total'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    סה"כ כללי
                  </button>
                  <button
                    onClick={() => setFormData({...formData, expensesMode: 'detailed'})}
                    className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                      formData.expensesMode === 'detailed'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    פירוט 42 קטגוריות
                  </button>
                </div>
              </div>

              {/* Mode 1: Total Expenses */}
              {formData.expensesMode === 'total' && (
                <div>
                  <label className="block text-slate-300 text-sm mb-2">סך הוצאות חודשיות *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalExpenses}
                    onChange={(e) => setFormData({...formData, totalExpenses: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
                    placeholder="לדוגמה: 8000"
                  />
                  <div className="mt-3 bg-slate-700/50 p-3 rounded">
                    <p className="text-slate-300 text-sm">סה"כ הוצאות: <span className="text-white font-semibold">₪{formData.totalExpenses.toLocaleString('he-IL')}</span></p>
                  </div>
                </div>
              )}

              {/* Mode 2: Detailed Expenses */}
              {formData.expensesMode === 'detailed' && (
                <div className="space-y-3">
                  {EXPENSE_CATEGORIES.map((category) => (
                    <div key={category}>
                      <label className="block text-slate-300 text-sm mb-1">{category}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.expenses[category] || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          expenses: {
                            ...formData.expenses,
                            [category]: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                  <div className="mt-4 bg-slate-700/50 p-3 rounded border-t-2 border-blue-600">
                    <p className="text-slate-300 text-sm">סה"כ הוצאות: <span className="text-white font-semibold text-lg">₪{calculateTotalExpensesFromDetailed().toLocaleString('he-IL')}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Debts */}
        {step === 3 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">הוסף חובות</h2>
            
            {/* Debt Type */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">סוג החוב *</label>
              <select
                value={currentDebt.category || ''}
                onChange={(e) => setCurrentDebt(prev => ({...prev, category: e.target.value}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">בחר סוג חוב</option>
                <option value="bank_loan">הלוואה מבנק</option>
                <option value="credit_card_debt">חוב על כרטיס אשראי</option>
                <option value="credit_company_loan">הלוואה מחברת אשראי</option>
                <option value="credit_line_loan">הלוואה על מסגרת אשראי</option>
                <option value="finance_company_loan">הלוואה מחברת מימון</option>
                <option value="insurance_loan">הלוואה מחברת ביטוח</option>
                <option value="private_debt">חוב פרטי</option>
                <option value="lawyer_debt">חוב ממשרד עורכי דין</option>
                <option value="government_debt">חוב לממשלה</option>
                <option value="p2p_loan">הלוואה מבלנדר</option>
                <option value="collection_debt">חוב בגבייה</option>
              </select>
            </div>

            {/* Creditor Name */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">שם הנושה *</label>
              <select
                value={currentDebt.creditorName || ''}
                onChange={(e) => setCurrentDebt(prev => ({...prev, creditorName: e.target.value}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">בחר נושה...</option>
                {currentDebt.category && CREDITORS_BY_CATEGORY[currentDebt.category as keyof typeof CREDITORS_BY_CATEGORY]?.map(creditor => (
                  <option key={creditor.id} value={creditor.hebrewName}>
                    {creditor.hebrewName}
                  </option>
                ))}
                <option value="אחר">אחר (הקלד ידנית)</option>
              </select>
              {!currentDebt.category && (
                <p className="text-yellow-400 text-xs mt-1">בחר סוג חוב קודם כדי לראות רשימת נושים</p>
              )}
            </div>

            {/* Debt Amount */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">סכום החוב (בש"ח) *</label>
              <input
                type="number"
                min="0"
                placeholder="לדוגמה: 25000"
                value={currentDebt.amount && currentDebt.amount > 0 ? currentDebt.amount : ''}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setCurrentDebt(prev => ({...prev, amount: value}));
                  const error = validateField('amount', value);
                  setErrors(prev => ({ ...prev, debtAmount: error }));
                }}
                className={`w-full bg-slate-700 text-white p-3 rounded border outline-none ${
                  errors.debtAmount ? 'border-red-500 focus:border-red-500' : 'border-slate-600 focus:border-blue-500'
                }`}
              />
              {errors.debtAmount && <p className="text-red-400 text-xs mt-1">{errors.debtAmount}</p>}
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">ריבית שנתית (%) - אופציונלי</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="לדוגמה: 8.5"
                value={currentDebt.interest && currentDebt.interest > 0 ? currentDebt.interest : ''}
                onChange={(e) => setCurrentDebt(prev => ({...prev, interest: parseInt(e.target.value) || 0}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Question 1: Certainty */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">כמה בטוח אתה בנתונים האלה?</label>
              <select
                value={currentDebt.certainty || 'known'}
                onChange={(e) => setCurrentDebt(prev => ({...prev, certainty: e.target.value as any}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="known">ידוע - יש לי את כל המידע</option>
                <option value="estimated">בינוני - יש לי מידע חלקי</option>
                <option value="unknown">לא בטוח - אני מעריך בערך</option>
              </select>
            </div>

            {/* Question 2: Last Update */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">מתי עדכנת את הנתונים לאחרונה?</label>
              <select
                value={currentDebt.urgency || 'medium'}
                onChange={(e) => setCurrentDebt(prev => ({...prev, urgency: e.target.value as any}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="immediate">עדכני - בחודש האחרון</option>
                <option value="medium">חצי שנה - לפני 3-6 חודשים</option>
                <option value="low">שנה - לפני 6-12 חודשים</option>
              </select>
            </div>

            {/* Question 3: Status */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">מה סטטוס החוב הזה כרגע?</label>
              <select
                value={currentDebt.paymentStatus || 'current'}
                onChange={(e) => setCurrentDebt(prev => ({...prev, paymentStatus: e.target.value as any}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="current">פעיל - אני משלם כרגע</option>
                <option value="delayed">בעיכוב - יש עיכובים בתשלום</option>
                <option value="default">בהליכי הוצאה לפועל</option>
                <option value="enforcement">בהסדר - יש הסכם</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">תאריך התחלת החוב - אופציונלי</label>
              <input
                type="date"
                value={currentDebt.startDate || ''}
                onChange={(e) => setCurrentDebt(prev => ({...prev, startDate: e.target.value}))}
                className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddDebt}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded font-semibold transition-colors"
              >
                {editingDebtId ? 'עדכן חוב' : 'הוסף חוב'}
              </button>
              <button
                type="button"
                onClick={handleClearDebtForm}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded font-semibold transition-colors"
              >
                נקה
              </button>
            </div>

            {formData.debts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">רשימת החובות ({formData.debts.length})</h3>
                <div className="space-y-2">
                  {formData.debts.map(debt => (
                    <div 
                      key={debt.id} 
                      className={`bg-slate-700/50 p-3 rounded flex justify-between items-center cursor-pointer transition-colors ${
                        editingDebtId === debt.id ? 'border-2 border-blue-500 bg-slate-700' : 'hover:bg-slate-700'
                      }`}
                      onClick={() => handleEditDebt(debt)}
                    >
                      <div>
                        <p className="text-white font-semibold">{debt.category} - ₪{debt.amount.toLocaleString('he-IL')}</p>
                        <p className="text-slate-300 text-sm">{debt.creditorName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDebt(debt);
                          }}
                          className="text-blue-400 hover:text-blue-300 p-2"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDebt(debt.id);
                          }}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Additional */}
        {step === 4 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">מידע נוסף</h2>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasEnforcement}
                onChange={(e) => setFormData({...formData, hasEnforcement: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-white">יש הליכי הוצאה לפועל</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasLetters}
                onChange={(e) => setFormData({...formData, hasLetters: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-white">קיבלתי מכתבים מנושים</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasNegotiation}
                onChange={(e) => setFormData({...formData, hasNegotiation: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-white">ניסיתי משא ומתן עם נושים</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasLawyer}
                onChange={(e) => setFormData({...formData, hasLawyer: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-white">יש לי עורך דין</span>
            </label>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">סיכום האבחון</h2>
            
            <div className="bg-slate-700/50 p-4 rounded space-y-4">
              {/* Score */}
              <div>
                <p className="text-slate-300 text-sm mb-2">ניקוד סיכום</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-white">{Math.round(calculateTotalRisk())}</span>
                  <span className="text-slate-300">/400</span>
                </div>
              </div>

              {/* Persona Badge */}
              <div>
                <p className="text-slate-300 text-sm mb-2">פרסונה</p>
                <div className={`${getPersonaColor(getPersona(calculateTotalRisk()))} text-white px-4 py-2 rounded font-semibold inline-block`}>
                  {getPersona(calculateTotalRisk())}
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <p className="text-slate-300 text-sm mb-2">רמת סיכון</p>
                <p className="text-white font-semibold">{getRiskLevel(calculateTotalRisk())}</p>
              </div>

              {/* Summary */}
              <div className="border-t border-slate-600 pt-4">
                <p className="text-slate-300 text-sm mb-2">סיכום הנתונים:</p>
                <div className="space-y-1 text-slate-300 text-sm">
                  <p>• שם: {formData.fullName}</p>
                  <p>• הכנסה חודשית: ₪{formData.monthlyIncome.toLocaleString('he-IL')}</p>
                  <p>• סך הוצאות: ₪{(formData.expensesMode === 'total' ? formData.totalExpenses : calculateTotalExpensesFromDetailed()).toLocaleString('he-IL')}</p>
                  <p>• מספר חובות: {formData.debts.length}</p>
                  <p>• סך החובות: ₪{formData.debts.reduce((sum, d) => sum + d.amount, 0).toLocaleString('he-IL')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזור
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors flex items-center justify-center gap-2"
            >
              הבא
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded font-semibold transition-colors"
            >
              {isSaving ? 'שומר...' : 'סיים אבחון וצור פרופיל'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
