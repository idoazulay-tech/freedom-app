import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TriageWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    totalDebtAmount: '',
    debtType: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    paymentHistory: '',
    collectionActions: '',
    additionalContext: '',
  });

  const createDebtProfile = trpc.cases.createDebtProfile.useMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.totalDebtAmount || !formData.debtType) {
      toast.error('אנא מלא את כל השדות החובה');
      return;
    }

    setLoading(true);
    try {
      // כאן נקרא ל-AI כדי לסווג את החוב
      // לעת עתה נשתמש בערכים ברירת מחדל
      const result = await createDebtProfile.mutateAsync({
        totalDebtAmount: formData.totalDebtAmount,
        debtType: formData.debtType as any,
        severity: 'medium', // זה יבוא מה-AI בעתיד
        persona: 'dana', // זה יבוא מה-AI בעתיד
      });

      toast.success('הפרופיל שלך נוצר בהצלחה!');
      setLocation('/dashboard');
    } catch (error) {
      console.error('שגיאה:', error);
      toast.error('שגיאה ביצירת הפרופיל');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">אבחון החוב שלך</CardTitle>
            <CardDescription className="text-slate-400">
              שלב {step} מתוך 3 - בואו נבין את מצב החוב שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white">סכום החוב הכולל (ש"ח)</Label>
                  <Input
                    type="number"
                    placeholder="לדוגמה: 50000"
                    value={formData.totalDebtAmount}
                    onChange={(e) => handleInputChange('totalDebtAmount', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <Label className="text-white">סוג החוב</Label>
                  <Select value={formData.debtType} onValueChange={(value) => handleInputChange('debtType', value)}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="בחר סוג חוב" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="bank">הלוואה בנקאית</SelectItem>
                      <SelectItem value="credit_card">כרטיס אשראי</SelectItem>
                      <SelectItem value="personal_loan">הלוואה אישית</SelectItem>
                      <SelectItem value="mortgage">משכנתא</SelectItem>
                      <SelectItem value="tax">חוב מס</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">הכנסה חודשית (ש"ח)</Label>
                  <Input
                    type="number"
                    placeholder="לדוגמה: 10000"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Financial Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white">הוצאות חודשיות (ש"ח)</Label>
                  <Input
                    type="number"
                    placeholder="לדוגמה: 7000"
                    value={formData.monthlyExpenses}
                    onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <Label className="text-white">היסטוריית תשלומים</Label>
                  <Textarea
                    placeholder="תאר את היסטוריית התשלומים שלך (למשל: תשלומים בזמן, פיגורים וכו')"
                    value={formData.paymentHistory}
                    onChange={(e) => handleInputChange('paymentHistory', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Legal Status */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-white">פעולות גבייה או הליכים משפטיים</Label>
                  <Textarea
                    placeholder="תאר אם יש מכתבים משפטיים, הוצאה לפועל, או פעולות גבייה אחרות"
                    value={formData.collectionActions}
                    onChange={(e) => handleInputChange('collectionActions', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-white">מידע נוסף</Label>
                  <Textarea
                    placeholder="כל מידע נוסף שחשוב לך שנדע"
                    value={formData.additionalContext}
                    onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                חזור
              </Button>

              {step < 3 ? (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  הבא
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      מעבדים...
                    </>
                  ) : (
                    'סיים את האבחון'
                  )}
                </Button>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 mt-8 justify-center">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full ${
                    s <= step ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
