import React from 'react';
import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import { Task } from '../types';

interface StatCardsProps {
  tasks: Task[];
}

export const StatCards: React.FC<StatCardsProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      title: 'Total Tasks',
      value: total,
      subtext: 'Saved in Firestore',
      icon: ListTodo,
      accentColor: 'from-purple-600 to-indigo-600',
      bgColor: 'bg-purple-50/70',
      textColor: 'text-purple-700',
      badge: 'All Active',
    },
    {
      title: 'Pending Tasks',
      value: pending,
      subtext: 'Needs attention',
      icon: Clock,
      accentColor: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50/70',
      textColor: 'text-amber-700',
      badge: 'In Progress',
    },
    {
      title: 'Completed',
      value: completed,
      subtext: 'Marked as done',
      icon: CheckCircle2,
      accentColor: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50/70',
      textColor: 'text-emerald-700',
      badge: 'Finished',
    },
    {
      title: 'Completion Rate',
      value: `${completionPercentage}%`,
      subtext: `${completed} of ${total} finished`,
      icon: TrendingUp,
      accentColor: 'from-violet-600 to-purple-600',
      bgColor: 'bg-violet-50/70',
      textColor: 'text-violet-700',
      progress: completionPercentage,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-purple-100 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-500">{stat.title}</span>
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.textColor}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {stat.value}
              </span>
            </div>

            {/* Progress bar or Subtext */}
            {stat.progress !== undefined ? (
              <div className="mt-3">
                <div className="w-full bg-purple-100/70 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">{stat.subtext}</p>
              </div>
            ) : (
              <p className="text-[11px] sm:text-xs text-slate-500 mt-2 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                {stat.subtext}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};
