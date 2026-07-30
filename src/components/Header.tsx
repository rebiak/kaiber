import React from 'react';
import { Play, Shuffle, RotateCcw, Plus, ListOrdered, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenFocusMode: () => void;
  onOpenInterleaveMixer: () => void;
  onOpenNewRoutine: () => void;
  onResetPlan: () => void;
  totalSteps: number;
  completedSteps: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFocusMode,
  onOpenInterleaveMixer,
  onOpenNewRoutine,
  onResetPlan,
  totalSteps,
  completedSteps,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Brand & Identity */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
              <ListOrdered className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
                  Sequence Planner
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Interleave routine steps into custom execution plans
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full no-scrollbar">
            
            {/* Auto-Interleave Tool */}
            <button
              onClick={onOpenInterleaveMixer}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-xs shrink-0"
              title="Mix and interleave steps from multiple routines automatically"
            >
              <Shuffle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="whitespace-nowrap">Interleave</span>
            </button>

            {/* New Routine */}
            <button
              onClick={onOpenNewRoutine}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">New Routine</span>
            </button>

            {/* Reset Plan */}
            <button
              onClick={onResetPlan}
              className="inline-flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-colors shrink-0"
              title="Reset plan to example sequence or clear"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Prominent Focus Mode Launch Button */}
            <button
              onClick={onOpenFocusMode}
              disabled={totalSteps === 0}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-md transition-all transform active:scale-95 shrink-0 ${
                totalSteps === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span className="whitespace-nowrap">Focus Mode</span>
              {totalSteps > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-slate-950/30 rounded text-[10px] font-extrabold tracking-wide shrink-0">
                  {completedSteps}/{totalSteps}
                </span>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
