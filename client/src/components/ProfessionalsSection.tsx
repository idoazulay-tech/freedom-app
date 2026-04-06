import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Users, Star, MessageSquare, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Professional {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  rating: number;
  reviews: number;
  experience: number;
  description: string;
  matchScore?: number;
  urgency?: string;
}

export default function ProfessionalsSection() {
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [message, setMessage] = useState('');

  const { data: professionals, isLoading } = (trpc.diagnosis as any).getMatchedProfessionals.useQuery();
  const requestMutation = (trpc.diagnosis as any).requestProfessional.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message);
      setMessage('');
      setSelectedProfessional(null);
    },
    onError: (error: any) => {
      toast.error(`שגיאה: ${error.message}`);
    },
  });

  const handleRequestProfessional = async () => {
    if (!selectedProfessional) return;
    await requestMutation.mutateAsync({
      professionalId: selectedProfessional.id,
      message: message || undefined,
    });
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-700 border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            בעלי מקצוע מומלצים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-center">טוען בעלי מקצוע...</p>
        </CardContent>
      </Card>
    );
  }

  if (!professionals || professionals.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            בעלי מקצוע מומלצים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-center">לא נמצאו בעלי מקצוע מתאימים</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          בעלי מקצוע מומלצים
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {professionals.map((prof: Professional) => (
          <div
            key={prof.id}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all cursor-pointer"
            onClick={() => setSelectedProfessional(prof)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{prof.name}</h3>
                <p className="text-slate-400 text-sm">{prof.specialty}</p>
              </div>
              {prof.matchScore && (
                <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  התאמה: {prof.matchScore}%
                </Badge>
              )}
            </div>

            <p className="text-slate-300 text-sm mb-3">{prof.description}</p>

            <div className="flex items-center gap-4 mb-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-slate-300">{prof.rating}</span>
                <span className="text-slate-500">({prof.reviews} ביקורות)</span>
              </div>
              <div className="text-slate-400">
                ניסיון: {prof.experience} שנים
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `tel:${prof.phone}`;
                }}
              >
                <Phone className="w-4 h-4 ml-1" />
                {prof.phone}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${prof.email}`;
                }}
              >
                <Mail className="w-4 h-4 ml-1" />
                דוא"ל
              </Button>
            </div>
          </div>
        ))}

        {/* Request Modal */}
        {selectedProfessional && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">
                  בקשה ל-{selectedProfessional.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white block mb-2">הודעה (אופציונלי)</label>
                  <textarea
                    placeholder="תיאור המצב שלך או שאלה ספציפית..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedProfessional(null)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleRequestProfessional}
                    disabled={requestMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {requestMutation.isPending ? 'שולח...' : 'שלח בקשה'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
