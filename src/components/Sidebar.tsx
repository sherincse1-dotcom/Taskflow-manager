import React from 'react';
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  AlertTriangle,
  Sparkles,
  Database,
  X,
  GraduationCap
} from 'lucide-react';
import { TaskFilter, Task } from '../types';

interface SidebarProps {
  currentFilter: TaskFilter;
  onSelectFilter: (filter: TaskFilter) => void;
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentFilter,
  onSelectFilter,
  tasks,
  isOpen,
  onClose,
  onSeedDemo,
  isSeeding,
}) => {
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high' && t.status === 'pending').length;

  const navItems = [
    {
      id: 'all' as TaskFilter,
      label: 'All Tasks',
      icon: LayoutDashboard,
      count: totalCount,
      color: 'text-purple-600',
    },
    {
      id: 'pending' as TaskFilter,
      label: 'In Progress',
      icon: Clock,
      count: pendingCount,
      color: 'text-amber-600',
    },
    {
      id: 'completed' as TaskFilter,
      label: 'Completed',
      icon: CheckCircle2,
      count: completedCount,
      color: 'text-emerald-600',
    },
    {
      id: 'high-priority' as TaskFilter,
      label: 'High Priority',
      icon: AlertTriangle,
      count: highPriorityCount,
      color: 'text-rose-600',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-purple-100 shadow-sm">
      {/* Brand & Logo */}
      <div className="p-6 border-b border-purple-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-200">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              TaskFlow
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                PRO
              </span>
            </h1>
            <p className="text-xs text-purple-600/80 font-medium">Smart Task Manager</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-purple-50 transition"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Filter Links */}
      <div className="p-4 flex-1 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectFilter(item.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-300'
                  : 'text-slate-600 hover:bg-purple-50/70 hover:text-purple-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold transition ${
                  isActive
                    ? 'bg-purple-700 text-purple-100'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-purple-100'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}

        {/* Presentation & Demo helpers */}
        <div className="pt-6">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
            Presentation Demo
          </div>

          <div className="p-3.5 bg-gradient-to-br from-purple-50/80 to-indigo-50/50 rounded-xl border border-purple-100 text-xs text-slate-600 space-y-2.5">
            <p className="leading-relaxed">
              Need sample data for your solo presentation? Click below to populate the live Firestore database.
            </p>
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-purple-700 font-semibold text-xs rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-300 shadow-xs transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              {isSeeding ? 'Seeding Firestore...' : 'Load Demo Tasks'}
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <Database className="w-3 h-3 text-purple-500" />
              <span>Real Firestore Persistence</span>
            </div>
          </div>
        </div>
      </div>

      {/* College Presentation Footer Info */}
      <div className="p-4 border-t border-purple-50 bg-purple-50/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold">
            CS
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800">College Web Dev</p>
            <p className="text-[11px] text-slate-500">Solo Presentation Demo</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
