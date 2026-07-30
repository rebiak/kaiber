import React, { useState } from 'react';
import { Routine, PlanItem } from '../types';
import { generateId, getColorStyles } from '../utils/helpers';
import { X, Shuffle, Sparkles, Check, Layers, ArrowRight } from 'lucide-react';

interface InterleaveMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  routines: Routine[];
  onSetPlan: (newItems: PlanItem[]) => void;
}

export const InterleaveMixerModal: React.FC<InterleaveMixerModalProps> = ({
  isOpen,
  onClose,
  routines,
  onSetPlan,
}) => {
  if (!isOpen) return null;

  const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(
    routines.slice(0, 2).map((r) => r.id)
  );
  const [pattern, setPattern] = useState<'alternate' | 'chunk_2' | 'append'>('alternate');

  const toggleRoutineSelection = (id: string) => {
    setSelectedRoutineIds((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((i) => i !== id)
          : prev
        : [...prev, id]
    );
  };

  const handleGenerateSequence = () => {
    const selectedRoutines = routines.filter((r) => selectedRoutineIds.includes(r.id));
    if (selectedRoutines.length === 0) return;

    const newPlan: PlanItem[] = [];

    if (pattern === 'alternate' || pattern === 'chunk_2') {
      const stepQueues = selectedRoutines.map((r) => [...r.steps]);
      const chunkSize = pattern === 'chunk_2' ? 2 : 1;

      let hasMore = true;
      while (hasMore) {
        hasMore = false;
        for (let rIdx = 0; rIdx < selectedRoutines.length; rIdx++) {
          const routine = selectedRoutines[rIdx];
          const queue = stepQueues[rIdx];

          for (let c = 0; c < chunkSize; c++) {
            if (queue.length > 0) {
              hasMore = true;
              const step = queue.shift()!;
              newPlan.push({
                id: generateId('plan'),
                routineId: routine.id,
                routineTitle: routine.title,
                routineIcon: routine.icon,
                routineColor: routine.color,
                stepId: step.id,
                stepTitle: step.title,
                status: 'pending',
              });
            }
          }
        }
      }
    } else {
      // Append routine by routine
      selectedRoutines.forEach((routine) => {
        routine.steps.forEach((step) => {
          newPlan.push({
            id: generateId('plan'),
            routineId: routine.id,
            routineTitle: routine.title,
            routineIcon: routine.icon,
            routineColor: routine.color,
            stepId: step.id,
            stepTitle: step.title,
            status: 'pending',
          });
        });
      });
    }

    onSetPlan(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                AUTO-INTERLEAVE ROUTINES
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mix steps from selected routines into a single interleaved sequence
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Routines */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Select Routines to Interleave:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {routines.map((routine) => {
              const isSelected = selectedRoutineIds.includes(routine.id);
              const colorStyles = getColorStyles(routine.color);

              return (
                <button
                  type="button"
                  key={routine.id}
                  onClick={() => toggleRoutineSelection(routine.id)}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? `${colorStyles.border} ${colorStyles.bg} ring-2 ring-purple-500/30`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xl">{routine.icon}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {routine.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {routine.steps.length} steps
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      isSelected
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Interleaving Pattern */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Interleaving Pattern:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPattern('alternate')}
              className={`p-3 rounded-xl border text-center transition-all ${
                pattern === 'alternate'
                  ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs'
              }`}
            >
              <p className="text-xs font-bold">1-by-1 Alternating</p>
              <p className="text-[10px] opacity-75 mt-0.5">A1, B1, A2, B2...</p>
            </button>

            <button
              type="button"
              onClick={() => setPattern('chunk_2')}
              className={`p-3 rounded-xl border text-center transition-all ${
                pattern === 'chunk_2'
                  ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs'
              }`}
            >
              <p className="text-xs font-bold">2-by-2 Chunks</p>
              <p className="text-[10px] opacity-75 mt-0.5">A1, A2, B1, B2...</p>
            </button>

            <button
              type="button"
              onClick={() => setPattern('append')}
              className={`p-3 rounded-xl border text-center transition-all ${
                pattern === 'append'
                  ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-500 text-purple-700 dark:text-purple-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs'
              }`}
            >
              <p className="text-xs font-bold">Sequential</p>
              <p className="text-[10px] opacity-75 mt-0.5">All A, then All B</p>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGenerateSequence}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/20 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Interleaved Plan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
