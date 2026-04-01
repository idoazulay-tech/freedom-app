import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Lawyers() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">עורכי דין ויועצים</h1>
          <p className="text-slate-400">מצא את המומחה הנכון לך</p>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">עורכי דין ויועצים</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">דף עורכי דין ויועצים - בבנייה</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
