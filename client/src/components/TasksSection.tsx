import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import { trpc } from '@/lib/trpc';

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

const COMPLETED_TASKS_KEY = 'freedom_completed_tasks';

export default function TasksSection({ diagnosis }: { diagnosis?: DiagnosisData }) {
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_TASKS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch generated tasks from server (server generates based on stored diagnosis)
  const { data: generatedTasksData, isLoading: isPending } = (trpc.diagnosis as any).generateTasks.useQuery();

  // Mutation to complete a task
  const completeTaskMutation = ((trpc.diagnosis as any).completeTask?.useMutation?.() || { mutate: () => {} });

  useEffect(() => {
    if (generatedTasksData && Array.isArray(generatedTasksData)) {
      // Convert string dates to Date objects if needed
      const tasksWithDates = generatedTasksData.map((task: any) => ({
        ...task,
        dueDate: typeof task.dueDate === 'string' ? new Date(task.dueDate) : task.dueDate,
      }));
      setTasks(tasksWithDates);
    }
  }, [generatedTasksData]);

  // Persist completedTasks to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify([...completedTasks]));
    } catch {
      // ignore storage errors
    }
  }, [completedTasks]);

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

  if (isPending || tasks.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6 text-center">
          <p className="text-slate-400">טוען משימות...</p>
        </CardContent>
      </Card>
    );
  }

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
                      completeTaskMutation.mutate({ taskId: task.id });
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
