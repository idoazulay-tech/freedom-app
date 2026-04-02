import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  TrendingUp,
  Clock,
  Shield,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function ProfessionalLanding() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Users,
      title: 'ניהול לקוחות מרכזי',
      description: 'ניהול מלא של כל לקוחותיך במקום אחד עם היסטוריה מלאה וסטטוס עדכני',
    },
    {
      icon: BarChart3,
      title: 'ניתוח מקרים מתקדם',
      description: 'כלים לניתוח מקרים, הערכת סיכון, וקבלת החלטות מהירות וחכמות',
    },
    {
      icon: Clock,
      title: 'חיסכון בזמן',
      description: 'אוטומציה של משימות שגרתיות, דוחות אוטומטיים, ותזכורות חכמות',
    },
    {
      icon: MessageSquare,
      title: 'תקשורת משופרת',
      description: 'ממשק אחד לכל התקשורת עם לקוחות - הודעות, עדכונים, ותזכורות',
    },
    {
      icon: TrendingUp,
      title: 'עלייה בהכנסות',
      description: 'ניהול יעיל יותר = יכולת להטפל בעוד לקוחות ולהגדיל את ההכנסות',
    },
    {
      icon: Shield,
      title: 'אבטחה וסודיות',
      description: 'הצפנה מלאה של נתונים רגישים, ציות לתקנות הגנת הפרטיות',
    },
  ];

  const benefits = [
    'מעקב אוטומטי אחר חובות ותשלומים',
    'דוחות מפורטים לכל מקרה',
    'תזכורות אוטומטיות ללקוחות',
    'ניתוח סיכון מתקדם',
    'ממשק ידידותי וקל לשימוש',
    'תמיכה טכנית 24/7',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white ltr" dir="ltr">
            🔓 Freedom
          </div>
          <button
            onClick={() => setLocation('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← חזור לעמוד הבית
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Freedom לעורכי דין ומומחים פיננסיים
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            פלטפורמה מקצועית לניהול מקרי חוב, עקיבה אחר לקוחות, וניתוח סיכון מתקדם.
            כלים חכמים שחוסכים זמן ומגדילים הכנסות.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={() => setLocation('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg flex items-center justify-center gap-2"
            >
              התחל עכשיו
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 px-8 py-6 text-lg"
            >
              צפה בדמו
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          יכולות מקצועיות
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-blue-400" />
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            מה Freedom מציע לך
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-600 transition-colors"
              >
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                <span className="text-white text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          מקרי שימוש
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'עורכי דין',
              description: 'ניהול תיקים משפטיים, עקיבה אחר לקוחות, ודוחות אוטומטיים',
              icon: '⚖️',
            },
            {
              title: 'מומחים פיננסיים',
              description: 'ניתוח חובות, הערכת סיכון, וייעוץ לתכנון פיננסי',
              icon: '💰',
            },
            {
              title: 'חברות גביה',
              description: 'ניהול תיקי חובות, עקיבה אחר תשלומים, וניתוח התקדמות',
              icon: '📊',
            },
          ].map((useCase, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="text-4xl mb-3">{useCase.icon}</div>
                <CardTitle className="text-white">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          תמחור שקוף
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              name: 'סטארטר',
              price: '₪99',
              period: '/חודש',
              features: ['עד 10 לקוחות', 'ניתוח בסיסי', 'דוחות חודשיים'],
            },
            {
              name: 'פרו',
              price: '₪299',
              period: '/חודש',
              features: ['עד 100 לקוחות', 'ניתוח מתקדם', 'דוחות שבועיים', 'API'],
              popular: true,
            },
            {
              name: 'אנטרפרייז',
              price: 'מותאם',
              period: '',
              features: ['לקוחות בלתי מוגבלים', 'ניתוח מותאם אישית', 'תמיכה VIP'],
            },
          ].map((plan, idx) => (
            <Card
              key={idx}
              className={`${
                plan.popular
                  ? 'bg-blue-600 border-blue-500 scale-105'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <CardHeader>
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-300">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-white">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-slate-100'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  בחר תוכנית
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold text-white">
            מוכן להתחיל?
          </h2>
          <p className="text-xl text-blue-100">
            הצטרף לעורכי דין ומומחים פיננסיים שכבר משתמשים ב-Freedom
          </p>
          <Button
            onClick={() => setLocation('/dashboard')}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg"
          >
            התחל ניסיון חינם
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-12">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>© 2024 Freedom - כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}
