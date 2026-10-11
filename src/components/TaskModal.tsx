import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, AlignLeft, CheckCircle2 } from 'lucide-react';
import { Task, Priority, CreateTaskInput, UpdateTaskInput } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSubmit,
}) => {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');

  const [errors, setErrors] = useState<{ title?: string; dueDate?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || '');
      setStatus(taskToEdit.status);
    } else {
      // Default new task values
      setTitle('');
      setDescription('');
      setPriority('medium');
      // Default to tomorrow's date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
      setStatus('pending');
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { title?: string; dueDate?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Task title is required.';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Title must be 100 characters or less.';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        status,
      });
      onClose();
    } catch {
      // Errors handled by parent component toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDueDate(d.toISOString().split('T')[0]);
    if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden transform transition-all">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50/50 border-b border-purple-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                {isEditing ? <CheckCircle2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isEditing ? 'Edit Task' : 'Create New Task'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isEditing ? 'Update task details and priority' : 'Add a new task to your dashboard'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{title.length}/100</span>
              </div>
              <input
                type="text"
                placeholder="e.g., Finalize project report slides"
                value={title}
                maxLength={100}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  errors.title
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Description field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-purple-600" />
                  Description (Optional)
                </label>
                <span className="text-[11px] text-slate-400">{description.length}/1000</span>
              </div>
              <textarea
                rows={3}
                placeholder="Add subtasks, notes, or requirements..."
                value={description}
                maxLength={1000}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition resize-none"
              />
            </div>

            {/* Priority selection */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-purple-600" />
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  const styles: Record<Priority, string> = {
                    low: isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'border-slate-200 hover:border-emerald-300 text-slate-700 bg-white',
                    medium: isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 text-slate-700 bg-white',
                    high: isSelected
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'border-slate-200 hover:border-rose-300 text-slate-700 bg-white',
                  };

                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${styles[p]}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Quick shortcuts */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Due Date <span className="text-rose-500">*</span>
                </label>
                {/* Quick date chips */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDate(0)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(1)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(7)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium transition"
                  >
                    +7 Days
                  </button>
                </div>
              </div>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors({ ...errors, dueDate: undefined });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none focus:ring-2 transition ${
                  errors.dueDate
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                }`}
              />
              {errors.dueDate && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.dueDate}</p>
              )}
            </div>

            {/* Status (if editing) */}
            {isEditing && (
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      status === 'pending'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('completed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                      status === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-purple-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs shadow-sm shadow-purple-300 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
