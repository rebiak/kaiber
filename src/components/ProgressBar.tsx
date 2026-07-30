import React from 'react';
import { PlanItem } from '../types';
import { getColorStyles, getStatusDetails } from '../utils/helpers';
import { Play, CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';

interface ProgressBarProps {
  items: PlanItem[];
  onOpenFocusMode: () => void;
  onFocusStepIndex: (index: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  items,
  onOpenFocusMode,
  onFocusStepIndex,
}) => {
  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const skipped = items.filter((i) => i.status === 'skipped').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Determine current active step index (first in_progress or first pending)
  let activeIndex = items.findIndex((i) => i.status === 'in_progress');
  if (activeIndex === -1) {
    activeIndex = items.findIndex((i) => i.status === 'pending');
  }
  const activeItem = activeIndex !== -1 ? items[activeIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      {/* Top row: Progress info & Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              TODAY'S PLAN PROGRESS
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({completed} / {total} steps completed)
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            {percentage}% <span className="text-xs font-normal text-slate-500">Complete</span>
          </p>
        </div>

        {/* Status Pills Breakdown */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full text-xs font-semibold no-scrollbar">
          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 shrink-0 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>{completed} Completed</span>
          </span>
          {inProgress > 0 && (
            <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1 animate-pulse shrink-0 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
              <span>{inProgress} In Progress</span>
            </span>
          )}
          <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
            {pending} Pending
          </span>
          {skipped > 0 && (
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 shrink-0 whitespace-nowrap">
              {skipped} Skipped
            </span>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden flex p-0.5 border border-slate-200/60 dark:border-slate-700/60">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Active Step Highlight Box (Matches Prompt specification) */}
      {total > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-xl">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Current Step:
            </span>
            {activeItem ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeIndex + 1} of {total}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {activeItem.stepTitle}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${getColorStyles(activeItem.routineColor).badgeBg}`}>
                  {activeItem.routineIcon} {activeItem.routineTitle}
                </span>
              </div>
            ) : (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>All steps in sequence are completed! Fantastic job!</span>
              </p>
            )}
          </div>

          <button
            onClick={() => {
              if (activeIndex !== -1) {
                onFocusStepIndex(activeIndex);
              }
              onOpenFocusMode();
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center space-x-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Focus Mode</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
};
