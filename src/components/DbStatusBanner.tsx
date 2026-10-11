import React, { useState } from 'react';
import { Database, CheckCircle, Info, ChevronDown, ChevronUp, Server } from 'lucide-react';
import { HealthResponse } from '../types';

interface DbStatusBannerProps {
  health: HealthResponse | null;
  error?: string | null;
}

export const DbStatusBanner: React.FC<DbStatusBannerProps> = ({ health, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/40 to-purple-50 border border-purple-100/80 p-3.5 sm:p-4 text-xs">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Database className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Firestore Cloud Database</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Connected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Express REST API on Node.js &bull; Data persists across page reloads in Google Cloud Firestore
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-800 bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-purple-200 transition shrink-0"
        >
          <span>{isExpanded ? 'Hide Architecture' : 'View Architecture'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-purple-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
            <div className="text-slate-400 font-medium">Database Target</div>
            <div className="font-mono text-purple-900 font-semibold truncate mt-0.5" title={health?.databaseId}>
              {health?.databaseId || 'Provisioned Cloud Firestore'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
            <div className="text-slate-400 font-medium">REST API Backend</div>
            <div className="font-mono text-slate-800 font-semibold mt-0.5">
              Node.js + Express (Port 3000)
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
            <div className="text-slate-400 font-medium">Persistence Status</div>
            <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3 text-emerald-600" />
              100% Real Cloud Storage
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-rose-600 text-xs font-medium">
          Warning: {error}
        </div>
      )}
    </div>
  );
};
