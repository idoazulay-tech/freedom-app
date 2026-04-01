import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface ProHubLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function ProHubLayout({ children, currentPage = 'dashboard' }: ProHubLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'dashboard', label: 'דשבורד', icon: LayoutDashboard, path: '/pro-hub' },
    { id: 'clients', label: 'לקוחות', icon: Users, path: '/pro-hub/clients' },
    { id: 'cases', label: 'מקרים', icon: FileText, path: '/pro-hub/cases' },
    { id: 'tasks', label: 'משימות', icon: CheckSquare, path: '/pro-hub/tasks' },
    { id: 'messages', label: 'הודעות', icon: MessageSquare, path: '/pro-hub/messages' },
    { id: 'analytics', label: 'דוחות', icon: BarChart3, path: '/pro-hub/analytics' },
  ];

  const handleLogout = () => {
    setLocation('/');
  };

  return (
    <div className="flex h-screen bg-background text-foreground" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 border-l border-slate-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-white">🔓 Pro</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-right">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          {sidebarOpen && user && (
            <div className="px-4 py-3 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-400">משתמש</p>
              <p className="text-white font-medium truncate">{user.name || 'משתמש'}</p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="mr-2">התנתק</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {navigationItems.find((item) => item.id === currentPage)?.label || 'Pro Hub'}
          </h2>
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString('he-IL')}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
