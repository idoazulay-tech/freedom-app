import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'urgent',
      title: '⚠️ סטטוס קריטי',
      message: 'אבחון שלך מצביע על מצב קריטי. בקש עזרה משפטית ויועוץ כלכלי מיידי.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'warning',
      title: '📬 מכתבי התראה',
      message: 'קיימים מכתבי התראה. הגב עליהם בתוך 30 ימים.',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'info',
      title: '📊 הרבה נושים',
      message: 'יש לך 7 נושים. שקול לנהל משא ומתן מרוכז.',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const unreadCount = notifications.filter((n) => !n.readAt).length;
  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.readAt) : notifications;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'info':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'success':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days < 7) return `לפני ${days} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date() } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date() }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-white">מרכז התראות</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  {unreadCount} חדשות
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                onClick={markAllAsRead}
              >
                סמן הכל כנקרא
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="text-xs"
        >
          הכל ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
          className="text-xs"
        >
          לא נקרא ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <Card
            key={notif.id}
            className={`border ${getNotificationColor(notif.type)} ${notif.readAt ? 'opacity-60' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{notif.title}</h3>
                      <p className="text-sm mt-1">{notif.message}</p>
                      <p className="text-xs mt-2 opacity-70">{getTimeAgo(notif.createdAt)}</p>
                    </div>
                  </div>

                  {notif.actionUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 border-current text-current hover:bg-current/10"
                    >
                      {notif.actionLabel || 'צפה'}
                    </Button>
                  )}
                </div>

                <div className="flex gap-2">
                  {!notif.readAt && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-current/20"
                      onClick={() => markAsRead(notif.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-500/20 text-red-400"
                    onClick={() => deleteNotification(notif.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">
              {filter === 'unread' ? 'אין התראות חדשות' : 'אין התראות'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Notification Preferences */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-sm">העדפות התראות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">התראות דוא"ל</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">התראות WhatsApp</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">התראות בתוך האפליקציה</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
