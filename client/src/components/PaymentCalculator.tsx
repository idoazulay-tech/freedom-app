import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingDown } from 'lucide-react';

interface Props {
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface PaymentScenario {
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterestPaid: number;
  totalPaid: number;
  percentOfIncome: number;
}

export default function PaymentCalculator({ totalDebt, monthlyIncome, monthlyExpenses }: Props) {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);

  // חשב תרחישים שונים
  const scenarios = useMemo(() => {
    const availableForDebt = Math.max(0, monthlyIncome - monthlyExpenses);
    const percentages = [10, 20, 50, 75, 100]; // אחוזים מהכנסה זמינה

    return percentages.map((percentage) => {
      const monthlyPayment = (availableForDebt * percentage) / 100;
      if (monthlyPayment <= 0) {
        return {
          monthlyPayment: 0,
          monthsToPayoff: Infinity,
          totalInterestPaid: 0,
          totalPaid: 0,
          percentOfIncome: 0,
        };
      }

      // הנחה: ריבית ממוצעת של 8% בשנה = 0.67% בחודש
      const monthlyInterestRate = 0.08 / 12;
      let remainingDebt = totalDebt;
      let monthsToPayoff = 0;
      let totalInterestPaid = 0;

      // חשב כמה חודשים לפי נוסחה של הלוואה
      while (remainingDebt > 0 && monthsToPayoff < 600) {
        // 50 שנים מקסימום
        const interestThisMonth = remainingDebt * monthlyInterestRate;
        const principalThisMonth = monthlyPayment - interestThisMonth;

        if (principalThisMonth <= 0) {
          // לא מספיק כדי לכסות ריבית
          monthsToPayoff = Infinity;
          break;
        }

        remainingDebt -= principalThisMonth;
        totalInterestPaid += interestThisMonth;
        monthsToPayoff++;
      }

      const totalPaid = totalDebt + totalInterestPaid;
      const percentOfIncome = (monthlyPayment / monthlyIncome) * 100;

      return {
        monthlyPayment: Math.round(monthlyPayment),
        monthsToPayoff,
        totalInterestPaid: Math.round(totalInterestPaid),
        totalPaid: Math.round(totalPaid),
        percentOfIncome: Math.round(percentOfIncome * 10) / 10,
      };
    });
  }, [totalDebt, monthlyIncome, monthlyExpenses]);

  const getScenarioLabel = (idx: number) => {
    const labels = ['10%', '20%', '50%', '75%', '100%'];
    return labels[idx];
  };

  const getRecommendation = (scenario: PaymentScenario) => {
    if (scenario.monthsToPayoff === Infinity) {
      return '❌ לא מספיק לכסות ריבית';
    }
    if (scenario.monthsToPayoff > 300) {
      return '⚠️ זמן ארוך מדי';
    }
    if (scenario.percentOfIncome > 50) {
      return '⚠️ יותר מ-50% מהכנסה';
    }
    if (scenario.percentOfIncome > 30) {
      return '✓ סביר אבל קשה';
    }
    return '✅ מומלץ';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          מחשבון תשלומים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* סיכום */}
        <div className="bg-slate-700/50 rounded p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-300">סה"כ חוב:</span>
            <span className="text-white font-bold">₪{totalDebt.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">הכנסה חודשית:</span>
            <span className="text-white font-bold">₪{monthlyIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">הוצאות חודשיות:</span>
            <span className="text-white font-bold">₪{monthlyExpenses.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-slate-600 pt-2">
            <span className="text-slate-300">זמין לתשלום חוב:</span>
            <span className="text-green-400 font-bold">
              ₪{Math.max(0, monthlyIncome - monthlyExpenses).toLocaleString()}
            </span>
          </div>
        </div>

        {/* תרחישים */}
        <div className="space-y-3">
          <h3 className="text-slate-300 font-semibold">תרחישי תשלום:</h3>
          {scenarios.map((scenario, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedScenario(idx)}
              className={`border rounded-lg p-4 cursor-pointer transition ${
                selectedScenario === idx
                  ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">
                    תרחיש {getScenarioLabel(idx)} - ₪{scenario.monthlyPayment.toLocaleString()}/חודש
                  </div>
                  <div className="text-sm">
                    {scenario.percentOfIncome.toFixed(1)}% מהכנסה
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{getRecommendation(scenario)}</div>
                </div>
              </div>

              {selectedScenario === idx && (
                <div className="mt-3 pt-3 border-t border-slate-600 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>זמן להשלמה:</span>
                    <span className="font-semibold">
                      {scenario.monthsToPayoff === Infinity
                        ? 'אינסופי'
                        : `${Math.floor(scenario.monthsToPayoff / 12)} שנים ${scenario.monthsToPayoff % 12} חודשים`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ריביות שישלם:</span>
                    <span className="font-semibold">₪{scenario.totalInterestPaid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>סה"כ תשלום:</span>
                    <span className="font-semibold">₪{scenario.totalPaid.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* הערה */}
        <div className="bg-slate-700/50 rounded p-3 text-sm text-slate-300">
          <p>
            💡 חישוב זה מניח ריבית ממוצעת של 8% בשנה. הריביות בפועל עשויות להיות שונות לפי סוג החוב.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
