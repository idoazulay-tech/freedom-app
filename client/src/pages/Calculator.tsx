import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Calculator() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">מחשבון חוב</h1>
          <p className="text-slate-400">חשב את התשלום החודשי שלך</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">מחשבון חוב</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">דף מחשבון חוב - בבנייה</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
