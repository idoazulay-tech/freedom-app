import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react';

export default function PersonalProfile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'דוד כהן',
    email: 'david@example.com',
    phone: '050-1234567',
    address: 'תל אביב, ישראל',
  });

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save to database
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur mb-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white ltr" dir="ltr">🔓 Freedom</div>
          <button
            onClick={() => setLocation('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← חזור לדשבורד
          </button>
        </div>
      </nav>

      <div className="container mx-auto max-w-2xl space-y-6">
        {/* Profile Header */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {formData.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">{formData.name}</CardTitle>
                  <p className="text-slate-400">משתמש Freedom</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isEditing ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Edit2 className="w-6 h-6" />
                )}
              </button>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              פרטים אישיים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">שם מלא</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">אימייל</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">טלפון</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">כתובת</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    שמור
                  </Button>
                  <Button
                    onClick={handleCancel}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    ביטול
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>{formData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>{formData.address}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Summary */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">סיכום חובות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">סך החוב</p>
                <p className="text-2xl font-bold text-white">₪124,000</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">מספר נושים</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">סטטוס</p>
                <p className="text-lg font-bold text-yellow-400">בטיפול</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">רמת סיכון</p>
                <p className="text-lg font-bold text-red-400">גבוהה</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">מסלול הטיפול שלך</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: 1, title: 'אבחון', status: 'completed', date: '01/04/2024' },
                { step: 2, title: 'סיכום', status: 'completed', date: '01/04/2024' },
                { step: 3, title: 'חיבור', status: 'in_progress', date: 'בעבודה' },
                { step: 4, title: 'ליווי', status: 'pending', date: 'בהמתנה' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      item.status === 'completed'
                        ? 'bg-green-600'
                        : item.status === 'in_progress'
                          ? 'bg-blue-600'
                          : 'bg-slate-600'
                    }`}
                  >
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.date}</p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      item.status === 'completed'
                        ? 'text-green-400'
                        : item.status === 'in_progress'
                          ? 'text-blue-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {item.status === 'completed'
                      ? 'הושלם'
                      : item.status === 'in_progress'
                        ? 'בעבודה'
                        : 'בהמתנה'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setLocation('/tracker')}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            עקיבה אחר החובות
          </Button>
          <Button
            onClick={() => setLocation('/payment-plan')}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            סדר לחובות
          </Button>
        </div>
      </div>
    </div>
  );
}
