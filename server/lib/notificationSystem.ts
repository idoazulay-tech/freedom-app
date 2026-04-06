/**
 * Notification System
 * Handles in-app, email, and WhatsApp notifications
 */

export type NotificationType = 'urgent' | 'warning' | 'info' | 'success';
export type NotificationChannel = 'in_app' | 'email' | 'whatsapp';

export interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  channels: NotificationChannel[];
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export interface NotificationPreferences {
  userId: number;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  inAppNotifications: boolean;
  urgentOnly: boolean;
  phoneNumber?: string;
  email?: string;
}

/**
 * Create notification
 */
export function createNotification(input: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    channels: input.channels || ['in_app'],
    createdAt: new Date(),
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel,
    relatedEntityId: input.relatedEntityId,
    relatedEntityType: input.relatedEntityType,
  };
}

/**
 * Generate notifications based on diagnosis events
 */
export function generateDiagnosisNotifications(input: {
  userId: number;
  riskLevel: string;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  creditorCount: number;
}): Notification[] {
  const notifications: Notification[] = [];

  // Critical risk notification
  if (input.riskLevel === 'critical') {
    notifications.push(
      createNotification({
        userId: input.userId,
        type: 'urgent',
        title: '⚠️ סטטוס קריטי',
        message:
          'אבחון שלך מצביע על מצב קריטי. בקש עזרה משפטית ויועוץ כלכלי מיידי.',
        channels: ['in_app', 'email', 'whatsapp'],
        actionUrl: '/profile',
        actionLabel: 'צפה בפרטים',
        relatedEntityType: 'diagnosis',
      })
    );
  }

  // High risk notification
  if (input.riskLevel === 'high') {
    notifications.push(
      createNotification({
        userId: input.userId,
        type: 'warning',
        title: '⚡ סיכון גבוה',
        message:
          'אבחון שלך מצביע על סיכון גבוה. שקול להתייעץ עם בעל מקצוע.',
        channels: ['in_app', 'email'],
        actionUrl: '/profile',
        actionLabel: 'צפה בפרטים',
        relatedEntityType: 'diagnosis',
      })
    );
  }

  // Enforcement notification
  if (input.hasEnforcement) {
    notifications.push(
      createNotification({
        userId: input.userId,
        type: 'urgent',
        title: '🚨 הוצל"פ פעיל',
        message:
          'יש הוצל"פ פעיל נגדך. בקש ייעוץ משפטי דחוף מעורך דין.',
        channels: ['in_app', 'email', 'whatsapp'],
        actionUrl: '/profile/tasks',
        actionLabel: 'צפה במשימות',
        relatedEntityType: 'enforcement',
      })
    );
  }

  // Warning letters notification
  if (input.hasWarningLetters) {
    notifications.push(
      createNotification({
        userId: input.userId,
        type: 'warning',
        title: '📬 מכתבי התראה',
        message:
          'קיימים מכתבי התראה. הגב עליהם בתוך 30 ימים.',
        channels: ['in_app', 'email'],
        actionUrl: '/profile/documents',
        actionLabel: 'העלה מסמכים',
        relatedEntityType: 'warning_letter',
      })
    );
  }

  // Multiple creditors notification
  if (input.creditorCount > 5) {
    notifications.push(
      createNotification({
        userId: input.userId,
        type: 'info',
        title: '📊 הרבה נושים',
        message: `יש לך ${input.creditorCount} נושים. שקול לנהל משא ומתן מרוכז.`,
        channels: ['in_app'],
        actionUrl: '/profile/professionals',
        actionLabel: 'בקש עזרה',
        relatedEntityType: 'creditors',
      })
    );
  }

  return notifications;
}

/**
 * Generate task reminder notifications
 */
export function generateTaskReminders(input: {
  userId: number;
  tasks: Array<{
    id: string;
    title: string;
    dueDate: Date;
    priority: string;
  }>;
}): Notification[] {
  const notifications: Notification[] = [];
  const today = new Date();

  for (const task of input.tasks) {
    const daysUntilDue = Math.ceil(
      (task.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Urgent tasks (due in 3 days or less)
    if (daysUntilDue <= 3 && task.priority === 'urgent') {
      notifications.push(
        createNotification({
          userId: input.userId,
          type: 'urgent',
          title: `🔴 משימה דחופה: ${task.title}`,
          message: `משימה זו חייבת להיעשות בתוך ${daysUntilDue} ימים.`,
          channels: ['in_app', 'email'],
          actionUrl: '/profile/tasks',
          actionLabel: 'צפה במשימות',
          relatedEntityId: task.id,
          relatedEntityType: 'task',
        })
      );
    }

    // High priority tasks (due in 7 days or less)
    if (daysUntilDue <= 7 && task.priority === 'high') {
      notifications.push(
        createNotification({
          userId: input.userId,
          type: 'warning',
          title: `🟠 משימה חשובה: ${task.title}`,
          message: `משימה זו חייבת להיעשות בתוך ${daysUntilDue} ימים.`,
          channels: ['in_app'],
          actionUrl: '/profile/tasks',
          actionLabel: 'צפה במשימות',
          relatedEntityId: task.id,
          relatedEntityType: 'task',
        })
      );
    }
  }

  return notifications;
}

/**
 * Generate payment reminder notifications
 */
export function generatePaymentReminders(input: {
  userId: number;
  nextPaymentDate: Date;
  monthlyPayment: number;
  creditorName: string;
}): Notification {
  const today = new Date();
  const daysUntilPayment = Math.ceil(
    (input.nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return createNotification({
    userId: input.userId,
    type: daysUntilPayment <= 3 ? 'urgent' : 'info',
    title: `💳 תזכורת תשלום: ${input.creditorName}`,
    message: `תשלום של ₪${input.monthlyPayment.toLocaleString('he-IL')} יעבור בעוד ${daysUntilPayment} ימים.`,
    channels: ['in_app', 'email'],
    actionUrl: '/profile/payment-plan',
    actionLabel: 'צפה בתוכנית הפירעון',
    relatedEntityType: 'payment',
  });
}

/**
 * Get notification icon by type
 */
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'urgent':
      return '🚨';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    case 'success':
      return '✅';
    default:
      return '📢';
  }
}

/**
 * Get notification color by type
 */
export function getNotificationColor(type: NotificationType): string {
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
}
