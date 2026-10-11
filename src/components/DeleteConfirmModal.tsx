import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Task } from '../types';

interface DeleteConfirmModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  task,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(task.id);
      onClose();
    } catch {
      // handled in parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden transform transition-all p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Delete Task?</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-800">"{task.title}"</span>? This will permanently remove the record from your Google Cloud Firestore database.
          </p>

          <div className="mt-4 p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-left flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-800 leading-tight">
              This action cannot be undone. All associated task status and notes will be deleted.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition w-full"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs shadow-sm shadow-rose-200 transition-all w-full flex items-center justify-center gap-2"
            >
              {isDeleting && (
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
