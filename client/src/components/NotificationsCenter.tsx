import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Trash2, Check, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  // Fetch notifications from server
  const { data: fetchedNotifications, isLoading } = (trpc.diagnosis as any).listNotifications.useQuery();

  // Mutation to mark as read
  const markAsReadMutation = (trpc.diagnosis as any).markNotificationAsRead.useMutation({
    onSuccess: (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, readAt: new Date() } : n))
      );
    },
  });

  // Mutation to delete notification
  const deleteNotificationMutation = (trpc.diagnosis as any).deleteNotification.useMutation({
    onSuccess: (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
  });

  useEffect(() => {
    if (fetchedNotifications) {
      const notificationsWithDates = fetchedNotifications.map((n: any) => ({
        ...n,
        createdAt: typeof n.createdAt === 'string' ? new Date(n.createdAt) : n.createdAt,
        readAt: n.readAt ? (typeof n.readAt === 'string' ? new Date(n.readAt) : n.readAt) : undefined,
      }));
      setNotifications(notificationsWithDates);
    }
  }, [fetchedNotifications]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return '⚠️';
      case 'warning':
        return '📬';
      case 'info':
        return '📊';
      case 'success':
        return '✅';
      default:
        return '🔔';
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

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6 text-center">
          <p className="text-slate-400">טוען התראות...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              התראות
            </CardTitle>
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {unreadCount} חדשות
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={`border-slate-700 ${
              notification.readAt ? 'bg-slate-800/50' : 'bg-slate-800'
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3
                      className={`font-semibold ${
                        notification.readAt ? 'text-slate-400' : 'text-white'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <Badge
                      className={`${getNotificationColor(notification.type)} text-xs`}
                    >
                      {notification.type === 'urgent'
                        ? 'דחוף'
                        : notification.type === 'warning'
                          ? 'אזהרה'
                          : notification.type === 'info'
                            ? 'מידע'
                            : 'הצלחה'}
                    </Badge>
                  </div>

                  <p
                    className={`text-sm mb-2 ${
                      notification.readAt ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {getTimeAgo(notification.createdAt)}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.readAt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-green-400 hover:text-green-300"
                          onClick={() =>
                            markAsReadMutation.mutate({
                              notificationId: notification.id,
                            })
                          }
                        >
                          <Check className="w-3 h-3 mr-1" />
                          סמן כנקרא
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-400 hover:text-red-300"
                        onClick={() =>
                          deleteNotificationMutation.mutate({
                            notificationId: notification.id,
                          })
                        }
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        מחק
                      </Button>
                    </div>
                  </div>
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
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">
              {filter === 'unread' ? 'אין התראות חדשות' : 'אין התראות'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
