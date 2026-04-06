/**
 * Automated Tasks Generator
 * Generates actionable tasks based on diagnosis data
 */

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'legal' | 'financial' | 'communication' | 'documentation' | 'negotiation';
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  estimatedHours: number;
  relatedDebtIds?: number[];
}

/**
 * Generate tasks based on diagnosis
 */
export function generateTasks(input: {
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditorCount: number;
  hasEnforcement: boolean;
  hasWarningLetters: boolean;
  riskLevel: string;
  debts: Array<{ category: string; amount: number }>;
}): Task[] {
  const tasks: Task[] = [];
  const today = new Date();

  // Task 1: Immediate legal action if enforcement is active
  if (input.hasEnforcement) {
    tasks.push({
      id: 'task-legal-enforcement',
      title: 'בקש ייעוץ משפטי דחוף',
      description:
        'יש הוצל"פ פעיל נגדך. בקש ייעוץ משפטי מיידי מעורך דין המתמחה בחובות ודיני צרכנות.',
      priority: 'urgent',
      category: 'legal',
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'pending',
      estimatedHours: 2,
    });

    tasks.push({
      id: 'task-legal-response',
      title: 'הגש תשובה להוצל"פ',
      description:
        'הגש תשובה רשמית להוצל"פ דרך עורך דין. זה חיוני כדי להגן על זכויותיך.',
      priority: 'urgent',
      category: 'legal',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      estimatedHours: 3,
    });
  }

  // Task 2: Warning letters response
  if (input.hasWarningLetters) {
    tasks.push({
      id: 'task-warning-response',
      title: 'הגב על מכתבי התראה',
      description:
        'קבלת מכתבי התראה דורשת תגובה מהירה. בקש הנחה בריביות בתמורה לתוכנית פירעון.',
      priority: 'high',
      category: 'communication',
      dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
      status: 'pending',
      estimatedHours: 2,
    });
  }

  // Task 3: Contact creditors
  if (input.creditorCount > 0) {
    tasks.push({
      id: 'task-creditor-contact',
      title: `צור קשר עם ${input.creditorCount} נושים`,
      description:
        'צור קשר עם כל הנושים שלך. הציע להם תוכנית פירעון מובנית וממוקדת.',
      priority: input.riskLevel === 'critical' ? 'urgent' : 'high',
      category: 'communication',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      estimatedHours: input.creditorCount * 0.5,
    });

    tasks.push({
      id: 'task-creditor-negotiation',
      title: 'משא ומתן עם נושים',
      description:
        'בקש הנחה בריביות, הארכת תקופת פירעון, או הסדר חד פעמי. תיעד את כל התקשורת.',
      priority: input.riskLevel === 'critical' ? 'urgent' : 'high',
      category: 'negotiation',
      dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
      status: 'pending',
      estimatedHours: input.creditorCount * 1,
    });
  }

  // Task 4: Financial planning
  if (input.monthlyIncome > 0) {
    const availableForDebt = input.monthlyIncome - input.monthlyExpenses;

    if (availableForDebt < 0) {
      tasks.push({
        id: 'task-budget-reduction',
        title: 'הקטן הוצאות חודשיות',
        description:
          'הוצאותיך גבוהות מהכנסתך. זהה הוצאות שניתן להקטין או לחסל.',
        priority: 'urgent',
        category: 'financial',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        estimatedHours: 3,
      });
    } else if (availableForDebt < 1000) {
      tasks.push({
        id: 'task-income-increase',
        title: 'הגדל הכנסה חודשית',
        description:
          'הזמין הקצוב לחוב קטן מדי. חפש דרכים להגדיל את הכנסתך (עבודה נוספת, עסק צד, וכו\').',
        priority: 'high',
        category: 'financial',
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: 'pending',
        estimatedHours: 4,
      });
    }
  }

  // Task 5: Documentation
  tasks.push({
    id: 'task-documentation-collect',
    title: 'אסוף כל המסמכים הרלוונטיים',
    description:
      'אסוף: הודעות חוב, מכתבי התראה, הוצל"פ, הצהרות בנק, תלוש משכורת, וכל מסמך רלוונטי.',
    priority: 'high',
    category: 'documentation',
    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'pending',
    estimatedHours: 2,
  });

  tasks.push({
    id: 'task-documentation-organize',
    title: 'ארגן מסמכים לפי נושה',
    description:
      'ארגן את כל המסמכים לפי נושה. זה יעזור בהתקשרות עם בעלי מקצוע ובמשא ומתן.',
    priority: 'medium',
    category: 'documentation',
    dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
    status: 'pending',
    estimatedHours: 2,
  });

  // Task 6: Professional help
  if (input.riskLevel === 'critical') {
    tasks.push({
      id: 'task-professional-lawyer',
      title: 'בקש ייעוץ מעורך דין',
      description:
        'מצבך קריטי. בקש ייעוץ מעורך דין המתמחה בחובות ודיני צרכנות.',
      priority: 'urgent',
      category: 'legal',
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      status: 'pending',
      estimatedHours: 1,
    });
  }

  if (input.riskLevel === 'critical' || input.riskLevel === 'high') {
    tasks.push({
      id: 'task-professional-advisor',
      title: 'בקש ייעוץ מיועץ כלכלי',
      description:
        'בקש ייעוץ מיועץ כלכלי כדי לתכנן תוכנית פירעון מובנית וריאלית.',
      priority: 'high',
      category: 'financial',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'pending',
      estimatedHours: 1,
    });
  }

  // Task 7: Monitoring
  tasks.push({
    id: 'task-monitoring-setup',
    title: 'הגדר מעקב אחרון תשלומים',
    description:
      'הגדר תזכורות לתשלומים חודשיים. עקוב אחרי יתרות החוב וריביות.',
    priority: 'medium',
    category: 'financial',
    dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    status: 'pending',
    estimatedHours: 1,
  });

  return tasks;
}

/**
 * Get task priority color
 */
export function getTaskPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

/**
 * Get task category icon
 */
export function getTaskCategoryIcon(category: string): string {
  switch (category) {
    case 'legal':
      return '⚖️';
    case 'financial':
      return '💰';
    case 'communication':
      return '📞';
    case 'documentation':
      return '📄';
    case 'negotiation':
      return '🤝';
    default:
      return '📋';
  }
}

/**
 * Calculate days until due
 */
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  const diff = dueDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
