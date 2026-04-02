import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';

interface FormData {
  debts: Array<{ category: string; amount: number; riskScore: number }>;
  totalRisk: number;
  totalAmount: number;
  diagnosisData: Record<string, any>;
}

export default function ProfessionalDiagnosis() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    debts: [],
    totalRisk: 0,
    totalAmount: 0,
    diagnosisData: {},
  });

  const saveMutation = trpc.diagnosis.save.useMutation({
    onSuccess: () => {
      toast.success('אבחון נשמר בהצלחה!');
      setStep(1);
      setFormData({
        debts: [],
        totalRisk: 0,
        totalAmount: 0,
        diagnosisData: {},
      });
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
      await saveMutation.mutateAsync({
        riskScore: formData.totalRisk,
        riskLevel: formData.totalRisk > 150 ? 'critical' : formData.totalRisk > 100 ? 'high' : formData.totalRisk > 50 ? 'medium' : 'low',
        totalDebt: formData.totalAmount,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        availableForDebt: 0,
        creditorCount: formData.debts.length,
        hasEnforcement: false,
        hasWarningLetters: false,
        debts: formData.debts,
        actions: [],
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
                <p className="text-slate-300">הוסף פרטי החוב:</p>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="סכום החוב (₪)"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  />
                  <textarea
                    placeholder="הערה על החוב"
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
                <p className="text-slate-300">ענה על השאלות:</p>
                <div className="space-y-3">
                  {[
                    'האם יש הוצל"פ פעיל?',
                    'האם יש הליך משפטי?',
                    'האם יש משכנתא?',
                  ].map((question, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                      <input
                        type="checkbox"
                        id={`q${idx}`}
                        onChange={(e) => {
                          const newData = { ...formData.diagnosisData };
                          newData[`q${idx}`] = e.target.checked;
                          setFormData({ ...formData, diagnosisData: newData });
                        }}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`q${idx}`} className="text-white cursor-pointer flex-1">
                        {question}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">סכום כולל:</p>
                  <p className="text-2xl font-bold text-white">₪{formData.totalAmount.toLocaleString('he-IL')}</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">רמת סיכון:</p>
                  <p className="text-2xl font-bold text-white">{formData.totalRisk}</p>
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
