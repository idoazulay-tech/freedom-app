import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';

interface DiagnosisData {
  totalDebt: number;
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  creditorCount: number | null;
  hasEnforcement: boolean | null;
  hasWarningLetters: boolean | null;
  riskLevel: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'legal' | 'financial' | 'communication' | 'documentation' | 'negotiation';
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
}

export default function TasksSection({ diagnosis }: { diagnosis: DiagnosisData }) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const tasks = useMemo(() => {
    const generatedTasks: Task[] = [];
    const today = new Date();

    // Task 1: Immediate legal action if enforcement is active
    if (diagnosis.hasEnforcement) {
      generatedTasks.push({
        id: 'task-legal-enforcement',
        title: 'בקש ייעוץ משפטי דחוף',
        description:
          'יש הוצל"פ פעיל נגדך. בקש ייעוץ משפטי מיידי מעורך דין המתמחה בחובות ודיני צרכנות.',
        priority: 'urgent',
        category: 'legal',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: 2,
      });

      generatedTasks.push({
        id: 'task-legal-response',
        title: 'הגש תשובה להוצל"פ',
        description:
          'הגש תשובה רשמית להוצל"פ דרך עורך דין. זה חיוני כדי להגן על זכויותיך.',
        priority: 'urgent',
        category: 'legal',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: 3,
      });
    }

    // Task 2: Warning letters response
    if (diagnosis.hasWarningLetters) {
      generatedTasks.push({
        id: 'task-warning-response',
        title: 'הגב על מכתבי התראה',
        description:
          'קבלת מכתבי התראה דורשת תגובה מהירה. בקש הנחה בריביות בתמורה לתוכנית פירעון.',
        priority: 'high',
        category: 'communication',
        dueDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: 2,
      });
    }

    // Task 3: Contact creditors
    const creditorCount = diagnosis.creditorCount || 0;
    if (creditorCount > 0) {
      generatedTasks.push({
        id: 'task-creditor-contact',
        title: `צור קשר עם ${creditorCount} נושים`,
        description:
          'צור קשר עם כל הנושים שלך. הציע להם תוכנית פירעון מובנית וממוקדת.',
        priority: diagnosis.riskLevel === 'critical' ? 'urgent' : 'high',
        category: 'communication',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: creditorCount * 0.5,
      });

      generatedTasks.push({
        id: 'task-creditor-negotiation',
        title: 'משא ומתן עם נושים',
        description:
          'בקש הנחה בריביות, הארכת תקופת פירעון, או הסדר חד פעמי. תיעד את כל התקשורה.',
        priority: diagnosis.riskLevel === 'critical' ? 'urgent' : 'high',
        category: 'negotiation',
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: creditorCount * 1,
      });
    }

    // Task 4: Financial planning
    if ((diagnosis.monthlyIncome || 0) > 0) {
      const availableForDebt = (diagnosis.monthlyIncome || 0) - (diagnosis.monthlyExpenses || 0);

      if (availableForDebt < 0) {
        generatedTasks.push({
          id: 'task-budget-reduction',
          title: 'הקטן הוצאות חודשיות',
          description:
            'הוצאותיך גבוהות מהכנסתך. זהה הוצאות שניתן להקטין או לחסל.',
          priority: 'urgent',
          category: 'financial',
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
          estimatedHours: 3,
        });
      } else if (availableForDebt < 1000) {
        generatedTasks.push({
          id: 'task-income-increase',
          title: 'הגדל הכנסה חודשית',
          description:
            'הזמין הקצוב לחוב קטן מדי. חפש דרכים להגדיל את הכנסתך.',
          priority: 'high',
          category: 'financial',
          dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: 'pending',
          estimatedHours: 4,
        });
      }
    }

    // Task 5: Documentation
    generatedTasks.push({
      id: 'task-documentation-collect',
      title: 'אסוף כל המסמכים הרלוונטיים',
      description:
        'אסוף: הודעות חוב, מכתבי התראה, הוצל"פ, הצהרות בנק, תלוש משכורת.',
      priority: 'high',
      category: 'documentation',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: 'pending',
      estimatedHours: 2,
    });

    // Task 6: Professional help
    if (diagnosis.riskLevel === 'critical') {
      generatedTasks.push({
        id: 'task-professional-lawyer',
        title: 'בקש ייעוץ מעורך דין',
        description:
          'מצבך קריטי. בקש ייעוץ מעורך דין המתמחה בחובות ודיני צרכנות.',
        priority: 'urgent',
        category: 'legal',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'pending',
        estimatedHours: 1,
      });
    }

    return generatedTasks;
  }, [diagnosis]);

  const filteredTasks = filterPriority ? tasks.filter((t) => t.priority === filterPriority) : tasks;

  const getPriorityColor = (priority: string) => {
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
  };

  const getCategoryIcon = (category: string) => {
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
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diff = dueDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const completedCount = completedTasks.size;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">סה"כ משימות</p>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">דחופות</p>
                <p className="text-2xl font-bold text-red-400">{urgentCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">הושלמו</p>
                <p className="text-2xl font-bold text-green-400">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            <Button
              variant={filterPriority === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority(null)}
              className="text-xs"
            >
              הכל ({tasks.length})
            </Button>
            <Button
              variant={filterPriority === 'urgent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority('urgent')}
              className="text-xs"
            >
              דחוף ({tasks.filter((t) => t.priority === 'urgent').length})
            </Button>
            <Button
              variant={filterPriority === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPriority('high')}
              className="text-xs"
            >
              גבוה ({tasks.filter((t) => t.priority === 'high').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedTasks.has(task.id)}
                  onCheckedChange={(checked) => {
                    const newCompleted = new Set(completedTasks);
                    if (checked) {
                      newCompleted.add(task.id);
                    } else {
                      newCompleted.delete(task.id);
                    }
                    setCompletedTasks(newCompleted);
                  }}
                  className="mt-1"
                />

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(task.category)}</span>
                      <h3 className={`font-semibold ${completedTasks.has(task.id) ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                    </div>
                    <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                      {task.priority === 'urgent'
                        ? 'דחוף'
                        : task.priority === 'high'
                          ? 'גבוה'
                          : task.priority === 'medium'
                            ? 'בינוני'
                            : 'נמוך'}
                    </Badge>
                  </div>

                  <p className="text-slate-300 text-sm mb-3">{task.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {getDaysUntilDue(new Date(task.dueDate))} ימים
                      </span>
                    </div>
                    <div>⏱️ {task.estimatedHours} שעות</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredTasks.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400">אין משימות בקטגוריה זו</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
