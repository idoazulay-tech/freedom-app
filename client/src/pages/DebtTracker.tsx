import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebtTracker() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">עקבות חוב</h1>
          <p className="text-slate-400">עקוב אחר ההתקדמות שלך</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">עקבות חוב</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">דף עקבות חוב - בבנייה</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
