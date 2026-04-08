'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Trash2 } from 'lucide-react';

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
  const debtCategorySelectRef = useRef<HTMLSelectElement>(null);

  // Setup direct event listener for select
  useEffect(() => {
    const selectElement = debtCategorySelectRef.current;
    if (!selectElement) return;

    const handleSelectChange = (e: Event) => {
      const target = e.target as HTMLSelectElement;
      console.log('🔴 Direct event listener fired:', target.value);
      setCurrentDebt(prev => ({...prev, category: target.value}));
    };

    selectElement.addEventListener('change', handleSelectChange);
    return () => selectElement.removeEventListener('change', handleSelectChange);
  }, []);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    maritalStatus: '',
    dependents: 0,
    monthlyIncome: 0,
    incomeStability: '',
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
    console.log('🔵 handleNext called, current step:', step);
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    console.log('🔵 handlePrev called, current step:', step);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddDebt = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('🟢 handleAddDebt called');
    console.log('Current debt:', currentDebt);
    
    if (!currentDebt.category || !currentDebt.amount || !currentDebt.creditorName) {
      console.log('❌ Validation failed');
      toast.error('אנא מלא את כל השדות החובה');
      return;
    }

    console.log('✅ Validation passed, adding debt...');
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

    console.log('✅ Debt added successfully');
    toast.success('חוב נוסף בהצלחה!');
  };

  const handleRemoveDebt = (id: string) => {
    setFormData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));
  };

  const handleSubmit = () => {
    console.log('🟢 handleSubmit called');
    const totalRisk = calculateTotalRisk();
    const persona = getPersona(totalRisk);
    
    setFormData(prev => ({
      ...prev,
      totalRisk,
      persona
    }));

    // Navigate to profile
    navigate('/profile');
  };

  const calculateTotalRisk = (): number => {
    let risk = 0;
    
    // Financial layer (0-150)
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
            <input
              type="text"
              placeholder="שם מלא"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />
            <input
              type="tel"
              placeholder="05X-XXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />
            <input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />
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
            <input
              type="number"
              placeholder="מספר תלויים"
              value={formData.dependents}
              onChange={(e) => setFormData({...formData, dependents: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        {/* Step 2: Financial */}
        {step === 2 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">מצב כלכלי</h2>
            <input
              type="number"
              placeholder="הכנסה חודשית"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData({...formData, monthlyIncome: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />
            <select
              value={formData.incomeStability}
              onChange={(e) => setFormData({...formData, incomeStability: e.target.value})}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            >
              <option value="">בחר יציבות הכנסה</option>
              <option value="stable">קבועה</option>
              <option value="variable">משתנה</option>
              <option value="unstable">לא יציבה</option>
            </select>
            <div className="grid grid-cols-2 gap-3">
              {EXPENSE_CATEGORIES.map(cat => (
                <input
                  key={cat}
                  type="number"
                  placeholder={`${cat} (₪)`}
                  value={formData.expenses[cat] || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    expenses: {...formData.expenses, [cat]: parseInt(e.target.value) || 0}
                  })}
                  className="bg-slate-700 text-white p-2 rounded border border-slate-600 focus:border-blue-500 outline-none text-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Debts */}
        {step === 3 && (
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">הוסף חובות</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">בחר סוג חוב</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'creditCard', label: 'כרטיס אשראי' },
                  { value: 'bankLoan', label: 'הלוואה בנקאית' },
                  { value: 'personalLoan', label: 'הלוואה אישית' },
                  { value: 'mortgage', label: 'משכנתא' },
                  { value: 'other', label: 'אחר' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      console.log('🟢 Category button clicked:', option.value);
                      setCurrentDebt(prev => ({...prev, category: option.value}));
                    }}
                    className={`p-2 rounded text-sm font-medium transition-colors ${
                      currentDebt.category === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              placeholder="סכום חוב (₪)"
              value={currentDebt.amount || 0}
              onChange={(e) => setCurrentDebt(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="שם הנושה"
              value={currentDebt.creditorName || ''}
              onChange={(e) => setCurrentDebt(prev => ({...prev, creditorName: e.target.value}))}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={currentDebt.certainty || 'known'}
                onChange={(e) => setCurrentDebt(prev => ({...prev, certainty: e.target.value as any}))}
                className="bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="known">ידוע</option>
                <option value="estimated">משוער</option>
                <option value="unknown">לא יודע</option>
              </select>

              <select
                value={currentDebt.urgency || 'medium'}
                onChange={(e) => setCurrentDebt(prev => ({...prev, urgency: e.target.value as any}))}
                className="bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="immediate">מיידית</option>
                <option value="medium">בינונית</option>
                <option value="low">נמוכה</option>
              </select>
            </div>

            <input
              type="number"
              placeholder="ריביות (%)"
              value={currentDebt.interest || 0}
              onChange={(e) => setCurrentDebt(prev => ({...prev, interest: parseInt(e.target.value) || 0}))}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />

            <input
              type="date"
              value={currentDebt.startDate || ''}
              onChange={(e) => setCurrentDebt(prev => ({...prev, startDate: e.target.value}))}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            />

            <select
              value={currentDebt.paymentStatus || 'current'}
              onChange={(e) => setCurrentDebt(prev => ({...prev, paymentStatus: e.target.value as any}))}
              className="w-full bg-slate-700 text-white p-3 rounded border border-slate-600 focus:border-blue-500 outline-none"
            >
              <option value="current">עדכני</option>
              <option value="delayed">בעיכוב</option>
              <option value="default">בחדלות</option>
              <option value="enforcement">הוצל"פ</option>
            </select>

            <button
              type="button"
              onClick={handleAddDebt}
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded font-semibold transition-colors"
            >
              הוסף חוב
            </button>

            {formData.debts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold mb-3">חובות שנוספו ({formData.debts.length})</h3>
                <div className="space-y-2">
                  {formData.debts.map(debt => (
                    <div key={debt.id} className="bg-slate-700/50 p-3 rounded flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{debt.category} - ₪{debt.amount}</p>
                        <p className="text-slate-300 text-sm">{debt.creditorName}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveDebt(debt.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
            <div className="bg-slate-700/50 p-4 rounded">
              <p className="text-slate-300 text-sm">ניקוד סיכום: {calculateTotalRisk()}/400</p>
              <p className="text-white font-semibold">פרסונה: {getPersona(calculateTotalRisk())}</p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              חזור
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold transition-colors flex items-center justify-center gap-2"
            >
              הבא
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white p-3 rounded font-semibold transition-colors"
            >
              סיים אבחון
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
