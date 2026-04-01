import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  caseNumber: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'בדיקת מסמכים',
    description: 'בדוק את כל המסמכים שנשלחו על ידי הלקוח',
    assignee: 'דוד כהן',
    caseNumber: 'CASE-2024-001',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2024-04-05',
  },
  {
    id: 2,
    title: 'יצירת קשר עם נושה',
    description: 'התקשר לנושה וברר על אפשרויות סדר',
    assignee: 'שרה לוי',
    caseNumber: 'CASE-2024-002',
    priority: 'medium',
    status: 'pending',
    dueDate: '2024-04-10',
  },
  {
    id: 3,
    title: 'הכנת בקשה לבית משפט',
    description: 'הכן בקשה רשמית לבית משפט',
    assignee: 'יוסי ברק',
    caseNumber: 'CASE-2024-003',
    priority: 'high',
    status: 'pending',
    dueDate: '2024-04-03',
  },
];

export default function ProHubTasks() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>(
    'all'
  );

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const filteredTasks = mockTasks.filter((task) => {
    const matchesSearch =
      task.title.includes(searchTerm) ||
      task.description.includes(searchTerm) ||
      task.assignee.includes(searchTerm) ||
      task.caseNumber.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'נמוכה';
      case 'medium':
        return 'בינונית';
      case 'high':
        return 'גבוהה';
      default:
        return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <Circle className="w-5 h-5 text-slate-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'בהמתנה';
      case 'in_progress':
        return 'בטיפול';
      case 'completed':
        return 'הושלמה';
      default:
        return status;
    }
  };

  return (
    <ProHubLayout currentPage="tasks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">ניהול משימות</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            הוסף משימה חדשה
          </Button>
        </div>

        {/* Search & Filter */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="חפש משימה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all', 'pending', 'in_progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilterStatus(status as 'all' | 'pending' | 'in_progress' | 'completed')
                    }
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status === 'all' ? 'הכל' : getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <p className="text-slate-400 text-sm">{task.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="flex gap-4 text-sm text-slate-400">
                      <span>מקרה: {task.caseNumber}</span>
                      <span>משוייך ל: {task.assignee}</span>
                      <span>תאריך יעד: {task.dueDate}</span>
                      <span className="text-slate-300 font-medium">
                        {getStatusLabel(task.status)}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">
                      עדכן
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProHubLayout>
  );
}
