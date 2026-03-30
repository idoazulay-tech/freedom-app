import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Shield, Zap, Users } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { useLocation } from 'wouter';

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated && user) {
    // הפנה משתמשים מחובرים לדשבורד
    setLocation('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">🔓 Freedom</div>
          <Button asChild>
            <a href={getLoginUrl()}>כניסה</a>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            מבינים את החוב, מסדרים את הכיוון, ומחזירים לך שליטה
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Freedom היא פלטפורמה שמסייעת לאנשים בחוב להבין איפה הם עומדים, מה הצעד הבא, ואיך להגיע לעזרה הנכונה — בצורה ברורה, מהירה ובלי בלבול.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <a href={getLoginUrl()}>התחל עכשיו</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-600 text-white hover:bg-slate-800">
              <a href="#features">למד עוד</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">למה Freedom?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Zap className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">אבחון מהיר</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              להבין את מצב החוב שלך בלי להסתבך. תוך 3 דקות תדע בדיוק איפה אתה עומד.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Users className="w-8 h-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">הכוונה מדויקת</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              לדעת מה לעשות עכשיו ולאן לפנות. אנחנו מחברים אותך למומחה הנכון בדיוק בזמן הנכון.
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <Shield className="w-8 h-8 text-green-400 mb-2" />
              <CardTitle className="text-white">סדר וביטחון</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300">
              להפחית לחץ ולהחזיר תחושת שליטה. כל המסמכים שלך מוצפנים וממשק אחד לכל הדברים.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-slate-800/50 rounded-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-12">איך זה עובד?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              number: '1',
              title: 'אבחון',
              description: 'תענה על כמה שאלות פשוטות על החוב שלך',
            },
            {
              number: '2',
              title: 'סיווג',
              description: 'המערכת תסווג את מצבך ותציע מומחה מתאים',
            },
            {
              number: '3',
              title: 'חיבור',
              description: 'תתחבר למומחה בלחיצת כפתור אחת',
            },
            {
              number: '4',
              title: 'ליווי',
              description: 'תקבל תזכורות, משימות ועדכונים שוטפים',
            },
          ].map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-slate-300 text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-6">מוכן להתחיל?</h2>
        <p className="text-xl text-slate-300 mb-8">
          בדוק איפה אתה עומד עכשיו. זה חינם, מהיר ובלי התחייבות.
        </p>
        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
          <a href={getLoginUrl()}>בוא נתחיל</a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2026 Freedom - כל הזכויות שמורות</p>
          <p className="mt-2">Freedom מתאימה לחוק הגנת הפרטיות, תיקון 13 (2024)</p>
        </div>
      </footer>
    </div>
  );
}
