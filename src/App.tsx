import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sidebar,
} from './components/Sidebar';
import {
  Header,
} from './components/Header';
import {
  StatCards,
} from './components/StatCards';
import {
  TaskCard,
} from './components/TaskCard';
import {
  TaskModal,
} from './components/TaskModal';
import {
  DeleteConfirmModal,
} from './components/DeleteConfirmModal';
import {
  DbStatusBanner,
} from './components/DbStatusBanner';
import {
  Task,
  TaskFilter,
  SortOption,
  CreateTaskInput,
  UpdateTaskInput,
  HealthResponse,
} from './types';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  seedDemoTasks,
  fetchHealth,
} from './api';
import {
  Plus,
  Sparkles,
  Inbox,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Filters & Search
  const [currentFilter, setCurrentFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Modals state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const taskListRef = useRef<HTMLDivElement>(null);

  const handleFilterSelect = (filter: TaskFilter) => {
    setCurrentFilter(filter);
    setTimeout(() => {
      taskListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Load initial tasks & health
  const loadData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    setError(null);
    try {
      const [fetchedTasks, healthInfo] = await Promise.all([
        fetchTasks(),
        fetchHealth().catch(() => null),
      ]);
      setTasks(fetchedTasks);
      if (healthInfo) setHealth(healthInfo);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Unable to connect to the backend server. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search & Sort pipeline
  const filteredTasks = useMemo(() => {
    const isHighPriority = (p?: string) => String(p || '').trim().toLowerCase() === 'high';

    return tasks
      .filter((task) => {
        // Filter tabs
        if (currentFilter === 'pending' && task.status === 'completed') return false;
        if (currentFilter === 'completed' && task.status !== 'completed') return false;
        if (currentFilter === 'high-priority' && !isHighPriority(task.priority)) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'dueDateAsc') {
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        }
        if (sortOption === 'dueDateDesc') {
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        }
        if (sortOption === 'priority') {
          const priorityWeights: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const pA = String(a.priority || '').trim().toLowerCase();
          const pB = String(b.priority || '').trim().toLowerCase();
          return (priorityWeights[pB] || 0) - (priorityWeights[pA] || 0);
        }
        return 0;
      });
  }, [tasks, currentFilter, searchQuery, sortOption]);

  // Handlers
  const handleCreateOrUpdateTask = async (input: CreateTaskInput | UpdateTaskInput) => {
    try {
      if (taskToEdit) {
        // Update existing task
        const updated = await updateTask(taskToEdit.id, input);
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        showToast('Changes saved to Firestore successfully! ✅', 'success');
      } else {
        // Create new task
        const created = await createTask(input as CreateTaskInput);
        setTasks((prev) => [created, ...prev.filter((t) => t.id !== created.id)]);
        showToast('Task saved to Firestore successfully! ✅', 'success');
      }
      // Re-sync with backend to ensure exact counts, sorting, and state from database
      await loadData(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save task to database', 'error');
      throw err;
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setUpdatingTaskId(task.id);
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      showToast(
        nextStatus === 'completed' ? 'Task marked as completed! 🎉' : 'Task moved to In Progress',
        'info'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status', 'error');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task deleted from Firestore', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
      throw err;
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      const seeded = await seedDemoTasks();
      setTasks((prev) => [...seeded, ...prev]);
      showToast(`Added ${seeded.length} presentation demo tasks to Firestore!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to load demo tasks', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans antialiased selection:bg-purple-200 selection:text-purple-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] animate-bounce duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-800 text-white border-rose-700'
                : 'bg-purple-900 text-white border-purple-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentFilter={currentFilter}
        onSelectFilter={handleFilterSelect}
        tasks={tasks}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onSeedDemo={handleSeedDemo}
        isSeeding={isSeeding}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentFilter={currentFilter}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCreateModal={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onRefresh={() => loadData(false)}
          isLoading={isLoading}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Cloud Database Persistence Badge */}
          <DbStatusBanner health={health} error={error} />

          {/* Metric Dashboard Cards */}
          <StatCards
            tasks={tasks}
            currentFilter={currentFilter}
            onSelectFilter={handleFilterSelect}
          />

          {/* Filter Bar and Title */}
          <div
            ref={taskListRef}
            id="task-list-section"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 scroll-mt-24"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>
                  {currentFilter === 'all' && 'All Tasks'}
                  {currentFilter === 'pending' && 'In Progress Tasks'}
                  {currentFilter === 'completed' && 'Completed Tasks'}
                  {currentFilter === 'high-priority' && 'High Priority Tasks'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {filteredTasks.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery
                  ? `Showing results matching "${searchQuery}"`
                  : 'Real-time synchronization with Google Cloud Firestore'}
              </p>
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => handleFilterSelect('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  currentFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterSelect('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  currentFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
                }`}
              >
                Pending ({tasks.filter((t) => t.status !== 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterSelect('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  currentFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
                }`}
              >
                Completed ({tasks.filter((t) => t.status === 'completed').length})
              </button>
              <button
                type="button"
                onClick={() => handleFilterSelect('high-priority')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  currentFilter === 'high-priority'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
                }`}
              >
                High Priority ({tasks.filter((t) => String(t.priority || '').trim().toLowerCase() === 'high').length})
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && tasks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-purple-100 p-12 text-center shadow-xs">
              <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 text-base">Loading Tasks from Firestore...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Connecting to Google Cloud Firestore database and retrieving records.
              </p>
            </div>
          ) : filteredTasks.length > 0 ? (
            /* Task Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onDelete={(t) => setTaskToDelete(t)}
                  isUpdating={updatingTaskId === task.id}
                />
              ))}
            </div>
          ) : (
            /* Friendly Empty State */
            <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-14 text-center shadow-xs max-w-xl mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-50 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xs border border-purple-100">
                <Inbox className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery
                  ? 'No tasks match your search'
                  : currentFilter === 'completed'
                  ? 'No completed tasks yet'
                  : currentFilter === 'pending'
                  ? 'All tasks are completed!'
                  : currentFilter === 'high-priority'
                  ? 'No high priority tasks'
                  : 'No tasks found'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? `Try clearing your search query "${searchQuery}" or checking other filters.`
                  : 'Start tracking your college assignments, presentations, and daily activities by creating your first task.'}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-purple-300 transition flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create First Task</span>
                </button>

                <button
                  onClick={handleSeedDemo}
                  disabled={isSeeding}
                  className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs sm:text-sm rounded-xl border border-purple-200 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>{isSeeding ? 'Seeding...' : 'Load Sample Presentation Data'}</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
        onSubmit={handleCreateOrUpdateTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        task={taskToDelete}
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
}
