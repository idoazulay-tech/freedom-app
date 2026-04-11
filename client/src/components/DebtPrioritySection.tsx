import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { rankDebts, getDebtSummary } from '@shared/debt-priority';

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

interface Props {
  debts: Debt[];
}

export default function DebtPrioritySection({ debts }: Props) {
  if (!debts || debts.length === 0) {
    return null;
  }

  const ranked = rankDebts(debts);
  const summary = getDebtSummary(debts);

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-500/20 text-red-700 border-red-500/30';
    if (score >= 60) return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
    return 'bg-green-500/20 text-green-700 border-green-500/30';
  };

  const getPriorityIcon = (score: number) => {
    if (score >= 80) return <AlertCircle className="w-5 h-5" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5" />;
    if (score >= 40) return <Clock className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 80) return 'קריטי';
    if (score >= 60) return 'גבוה';
    if (score >= 40) return 'בינוני';
    return 'נמוך';
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          דירוג עדיפויות חובות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* סיכום לפי עדיפות */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-center">
            <div className="text-2xl font-bold text-red-500">{summary.critical.length}</div>
            <div className="text-xs text-red-400">קריטי</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{summary.high.length}</div>
            <div className="text-xs text-orange-400">גבוה</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{summary.medium.length}</div>
            <div className="text-xs text-yellow-400">בינוני</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{summary.low.length}</div>
            <div className="text-xs text-green-400">נמוך</div>
          </div>
        </div>

        {/* דירוג חובות */}
        <div className="space-y-3">
          {ranked.map((priority, idx) => (
            <div
              key={priority.debt.id}
              className={`border rounded-lg p-4 space-y-2 ${getPriorityColor(priority.priorityScore)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getPriorityIcon(priority.priorityScore)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">#{priority.rank}</span>
                      <span className="font-semibold">{priority.debt.category}</span>
                      <span className="text-sm">({priority.debt.creditorName})</span>
                    </div>
                    <div className="text-sm mt-1">{priority.reason}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">₪{priority.debt.amount.toLocaleString()}</div>
                  <div className="text-xs">ניקוד: {priority.priorityScore}</div>
                </div>
              </div>
              <div className="text-sm font-medium">💡 {priority.recommendation}</div>
            </div>
          ))}
        </div>

        {/* הערה */}
        <div className="bg-slate-700/50 rounded p-3 text-sm text-slate-300">
          <p>
            דירוג זה מחושב לפי: סטטוס תשלום (40%), דחיפות (30%), ריבית (20%), וגודל החוב (10%).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
