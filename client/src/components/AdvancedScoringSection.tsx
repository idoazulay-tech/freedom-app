import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface DiagnosisData {
  totalDebt: number;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  availableForDebt: number | null;
  creditorCount: number;
  hasEnforcement: boolean | null;
  hasWarningLetters: boolean | null;
  riskLevel: string;
}

export default function AdvancedScoringSection({ diagnosis }: { diagnosis: DiagnosisData }) {
  const advancedScore = useMemo(() => {
    const monthlyIncome = diagnosis.monthlyIncome || 1;
    const monthlyExpenses = diagnosis.monthlyExpenses || 0;

    // Calculate individual factor scores
    const debtRatio = diagnosis.totalDebt / monthlyIncome;
    let debtRatioScore = 0;
    if (debtRatio < 3) debtRatioScore = 5;
    else if (debtRatio < 6) debtRatioScore = 10;
    else if (debtRatio < 12) debtRatioScore = 20;
    else if (debtRatio < 24) debtRatioScore = 30;
    else debtRatioScore = 40;

    let enforcementScore = 0;
    if (diagnosis.hasEnforcement) enforcementScore += 15;
    if (diagnosis.hasWarningLetters) enforcementScore += 5;
    if (diagnosis.creditorCount > 5) enforcementScore += Math.min(5, diagnosis.creditorCount - 5);
    enforcementScore = Math.min(20, enforcementScore);

    const expenseRatio = monthlyExpenses / monthlyIncome;
    let incomeStabilityScore = 0;
    if (expenseRatio > 1) incomeStabilityScore = 20;
    else if (expenseRatio > 0.9) incomeStabilityScore = 15;
    else if (expenseRatio > 0.75) incomeStabilityScore = 10;
    else if (expenseRatio > 0.6) incomeStabilityScore = 5;
    else incomeStabilityScore = 0;

    let creditorDiversityScore = 0;
    if (diagnosis.creditorCount === 1) creditorDiversityScore = 8;
    else if (diagnosis.creditorCount <= 3) creditorDiversityScore = 5;
    else if (diagnosis.creditorCount <= 5) creditorDiversityScore = 3;
    else creditorDiversityScore = 0;

    let paymentHistoryScore = 0;
    if (diagnosis.hasEnforcement) paymentHistoryScore = 10;
    else if (diagnosis.hasWarningLetters) paymentHistoryScore = 7;
    else paymentHistoryScore = 0;

    let legalComplexityScore = 0;
    if (diagnosis.hasEnforcement) legalComplexityScore += 5;
    if (diagnosis.hasWarningLetters) legalComplexityScore += 3;
    legalComplexityScore = Math.min(10, legalComplexityScore);

    const totalScore =
      debtRatioScore +
      enforcementScore +
      incomeStabilityScore +
      creditorDiversityScore +
      paymentHistoryScore +
      legalComplexityScore;

    return {
      totalScore,
      factors: {
        debtRatio: { score: debtRatioScore, label: `יחס חוב/הכנסה: ${debtRatio.toFixed(1)}x` },
        enforcement: {
          score: enforcementScore,
          label: diagnosis.hasEnforcement ? 'הוצל"פ פעיל' : 'ללא הוצל"פ',
        },
        incomeStability: {
          score: incomeStabilityScore,
          label: `יחס הוצאות/הכנסה: ${expenseRatio.toFixed(1)}x`,
        },
        creditorDiversity: {
          score: creditorDiversityScore,
          label: `מספר נושים: ${diagnosis.creditorCount}`,
        },
        paymentHistory: {
          score: paymentHistoryScore,
          label: diagnosis.hasWarningLetters ? 'בעיות בתשלומים' : 'תשלומים תקינים',
        },
        legalComplexity: {
          score: legalComplexityScore,
          label: legalComplexityScore > 5 ? 'מורכבות גבוהה' : 'מורכבות נמוכה',
        },
      },
    };
  }, [diagnosis]);

  const getFactorColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 25) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (percentage < 50) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (percentage < 75) return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getScoreIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage < 25) return <CheckCircle className="w-4 h-4" />;
    if (percentage < 50) return <AlertTriangle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ניקוד סיכון מתקדם
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">ניקוד כולל:</span>
            <span className="text-4xl font-bold text-white">{advancedScore.totalScore}/200</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                advancedScore.totalScore > 150
                  ? 'bg-red-500'
                  : advancedScore.totalScore > 100
                    ? 'bg-orange-500'
                    : advancedScore.totalScore > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
              }`}
              style={{ width: `${(advancedScore.totalScore / 200) * 100}%` }}
            />
          </div>

          <div className="text-center">
            <Badge
              className={`text-lg px-4 py-2 ${
                advancedScore.totalScore > 150
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : advancedScore.totalScore > 100
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    : advancedScore.totalScore > 50
                      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                      : 'bg-green-500/20 text-green-300 border-green-500/30'
              }`}
            >
              {advancedScore.totalScore > 150
                ? 'קריטי'
                : advancedScore.totalScore > 100
                  ? 'גבוה'
                  : advancedScore.totalScore > 50
                    ? 'בינוני'
                    : 'נמוך'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Factor Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(advancedScore.factors).map(([key, factor]: any) => (
          <Card key={key} className={`border ${getFactorColor(factor.score, 40)}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getScoreIcon(factor.score, 40)}
                  <span className="text-sm font-semibold">{factor.label}</span>
                </div>
                <span className="text-lg font-bold">{factor.score}</span>
              </div>

              {/* Mini progress bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${
                    factor.score < 10
                      ? 'bg-green-500'
                      : factor.score < 20
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${(factor.score / 40) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">המלצות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {advancedScore.totalScore > 150 && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold mb-1">🚨 סטטוס קריטי</p>
              <p className="text-red-200 text-sm">
                פעל בדחיפות עם מומחים. שקול הליך פשרה או הסדר עם נושים.
              </p>
            </div>
          )}

          {advancedScore.totalScore > 100 && advancedScore.totalScore <= 150 && (
            <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 font-semibold mb-1">⚠️ סיכון גבוה</p>
              <p className="text-orange-200 text-sm">
                בקש עזרה מיועץ כלכלי. תכנן תוכנית פירעון מובנית.
              </p>
            </div>
          )}

          {advancedScore.totalScore > 50 && advancedScore.totalScore <= 100 && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 font-semibold mb-1">⚡ סיכון בינוני</p>
              <p className="text-yellow-200 text-sm">
                שקול הגדלת הכנסה או הקטנת הוצאות כדי לשפר את מצבך.
              </p>
            </div>
          )}

          {advancedScore.totalScore <= 50 && (
            <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-semibold mb-1">✓ סיכון נמוך</p>
              <p className="text-green-200 text-sm">
                מצבך יחסית טוב. המשך בתוכנית הפירעון הנוכחית.
              </p>
            </div>
          )}

          {advancedScore.factors.debtRatio.score > 30 && (
            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <p className="text-slate-300 text-sm">
                • דחוף: הקטן את היחס חוב/הכנסה - שקול הגדלת הכנסה או הקטנת הוצאות
              </p>
            </div>
          )}

          {advancedScore.factors.enforcement.score > 10 && (
            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <p className="text-slate-300 text-sm">
                • יש הוצל"פ פעיל - בקש עזרה משפטית מיידית מעורך דין
              </p>
            </div>
          )}

          {advancedScore.factors.incomeStability.score > 15 && (
            <div className="p-3 bg-slate-700/50 border border-slate-600 rounded-lg">
              <p className="text-slate-300 text-sm">
                • מצב כלכלי קשה - שקול הגדלת הכנסה או הקטנת הוצאות בדחיפות
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
