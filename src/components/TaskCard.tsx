import React from 'react';
import {
  Calendar,
  Check,
  Edit2,
  Trash2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  isUpdating?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  isUpdating = false,
}) => {
  const isCompleted = task.status === 'completed';

  // Priority Styling
  const priorityConfig: Record<Priority, { label: string; badge: string; dot: string }> = {
    low: {
      label: 'Low Priority',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    medium: {
      label: 'Medium Priority',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    high: {
      label: 'High Priority',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
  };

  const normalizedPriority = (String(task.priority || '').trim().toLowerCase() as Priority) || 'medium';
  const currentPriority = priorityConfig[normalizedPriority] || priorityConfig.medium;

  // Due Date Helper
  const getDueStatus = (dueDateStr: string) => {
    if (!dueDateStr) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr + 'T00:00:00');
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (isCompleted) {
      return {
        text: `Due ${dueDateStr}`,
        badge: 'text-slate-500 bg-slate-100',
        icon: Calendar,
      };
    }

    if (diffDays < 0) {
      return {
        text: `Overdue (${Math.abs(diffDays)}d ago)`,
        badge: 'text-rose-700 bg-rose-50 font-semibold border border-rose-200',
        icon: AlertCircle,
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due Today',
        badge: 'text-purple-700 bg-purple-100 font-semibold border border-purple-200',
        icon: Clock,
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due Tomorrow',
        badge: 'text-indigo-700 bg-indigo-50 border border-indigo-200',
        icon: Clock,
      };
    } else {
      return {
        text: `Due ${dueDateStr}`,
        badge: 'text-slate-600 bg-purple-50/50 border border-purple-100',
        icon: Calendar,
      };
    }
  };

  const dueInfo = getDueStatus(task.dueDate);
  const DueIcon = dueInfo?.icon || Calendar;

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between gap-3 ${
        isCompleted
          ? 'border-purple-100/60 bg-purple-50/15 opacity-85'
          : 'border-purple-100 hover:border-purple-300 hover:shadow-md'
      }`}
    >
      <div>
        {/* Top bar: Checkbox + Title + Action buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Custom Checkbox */}
            <button
              onClick={() => onToggleStatus(task)}
              disabled={isUpdating}
              title={isCompleted ? 'Mark as In Progress' : 'Mark as Completed'}
              className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0 ${
                isCompleted
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'border-2 border-slate-300 hover:border-purple-500 bg-white hover:bg-purple-50'
              }`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Title & Description */}
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-sm sm:text-base leading-snug break-words transition-all ${
                  isCompleted
                    ? 'line-through text-slate-400 font-normal'
                    : 'text-slate-900 group-hover:text-purple-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p
                  className={`mt-1.5 text-xs sm:text-sm leading-relaxed line-clamp-2 transition-all ${
                    isCompleted ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              disabled={isUpdating}
              title="Edit Task"
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task)}
              disabled={isUpdating}
              title="Delete Task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom metadata tags: Priority + Due Date */}
      <div className="pt-2 border-t border-purple-50 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Chip */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${currentPriority.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`} />
            {currentPriority.label}
          </span>

          {/* Due Date Chip */}
          {dueInfo && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${dueInfo.badge}`}
            >
              <DueIcon className="w-3 h-3" />
              <span>{dueInfo.text}</span>
            </span>
          )}
        </div>

        {/* Status chip */}
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isCompleted ? 'Done' : 'Pending'}
        </span>
      </div>
    </div>
  );
};
