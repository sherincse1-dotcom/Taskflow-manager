import React from 'react';
import {
  Menu,
  Plus,
  Search,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { SortOption } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCreateModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCreateModal,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-purple-100 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-3">
        {/* Mobile menu toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-purple-700 transition"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-xs text-slate-500">Manage, organize, and prioritize your daily workflow</p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end max-w-2xl">
          {/* Search bar */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-purple-200/80 bg-purple-50/30 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative hidden md:flex items-center">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                aria-label="Sort tasks by"
                className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="newest">Newest First</option>
                <option value="dueDateAsc">Due Date (Earliest)</option>
                <option value="dueDateDesc">Due Date (Latest)</option>
                <option value="priority">Priority (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh tasks from Firestore"
            className="p-2 rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 border border-slate-200/80 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {/* Add Task Primary Button */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-purple-300 transition-all transform active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
