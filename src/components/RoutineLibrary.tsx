import React, { useState } from 'react';
import { Routine, RoutineStep } from '../types';
import { getColorStyles } from '../utils/helpers';
import { Plus, GripVertical, ChevronDown, ChevronRight, Layers, Edit2, Trash2, Star } from 'lucide-react';

interface RoutineLibraryProps {
  routines: Routine[];
  onAddRoutineToPlan: (routineId: string) => void;
  onAddStepToPlan: (routineId: string, stepId: string) => void;
  onToggleFavoriteRoutine: (routineId: string) => void;
  onOpenNewRoutineModal: () => void;
  onEditRoutineModal: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onDragStartRoutine: (e: React.DragEvent, routine: Routine) => void;
  onDragStartStep: (e: React.DragEvent, routine: Routine, step: RoutineStep) => void;
}

export const RoutineLibrary: React.FC<RoutineLibraryProps> = ({
  routines,
  onAddRoutineToPlan,
  onAddStepToPlan,
  onToggleFavoriteRoutine,
  onOpenNewRoutineModal,
  onEditRoutineModal,
  onDeleteRoutine,
  onDragStartRoutine,
  onDragStartStep,
}) => {
  const [expandedRoutineIds, setExpandedRoutineIds] = useState<string[]>(
    routines.map((r) => r.id)
  );

  const toggleExpand = (id: string) => {
    setExpandedRoutineIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sort routines so favorited/priority routines always float to the top
  const sortedRoutines = [...routines].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return 0;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
            <span>ROUTINES</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Permanent templates. Star to prioritize at the top.
          </p>
        </div>
        <button
          onClick={onOpenNewRoutineModal}
          className="p-1.5 sm:p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors flex items-center space-x-1 text-xs font-semibold shrink-0"
          title="Create a new routine template"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Add Routine</span>
        </button>
      </div>

      {/* Routine Cards List */}
      <div className="space-y-2.5 sm:space-y-3.5">
        {sortedRoutines.map((routine) => {
          const colorStyles = getColorStyles(routine.color);
          const isExpanded = expandedRoutineIds.includes(routine.id);

          return (
            <div
              key={routine.id}
              className={`rounded-xl border transition-all duration-200 ${
                routine.isFavorite
                  ? 'border-amber-300 dark:border-amber-600/80 shadow-md ring-1 ring-amber-400/40'
                  : colorStyles.border
              } ${colorStyles.bg} overflow-hidden shadow-xs`}
            >
              {/* Routine Header Bar - Draggable whole routine */}
              <div
                draggable
                onDragStart={(e) => onDragStartRoutine(e, routine)}
                className="p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-grab active:cursor-grabbing hover:bg-white/40 dark:hover:bg-slate-800/40 select-none transition-colors group min-w-0"
              >
                {/* Routine Title & Icon Row */}
                <div className="flex items-center space-x-2 min-w-0 w-full sm:w-auto flex-1">
                  <div className="p-0.5 sm:p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpand(routine.id)}
                    className="flex items-center space-x-2 text-left min-w-0 flex-1 overflow-x-auto no-scrollbar group/title py-0.5"
                  >
                    <span className="text-lg sm:text-xl leading-none shrink-0">{routine.icon}</span>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      {routine.title}
                    </span>
                  </button>
                </div>

                {/* Routine Actions Toolbar */}
                <div className="flex items-center justify-between sm:justify-end space-x-1 shrink-0 w-full sm:w-auto pt-1 sm:pt-0 border-t border-slate-200/50 dark:border-slate-800/60 sm:border-t-0">
                  <div className="flex items-center space-x-1 ml-auto">
                    {/* Favorite / Priority Star Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteRoutine(routine.id);
                      }}
                      className={`p-1.5 rounded-md transition-all shrink-0 ${
                        routine.isFavorite
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-500 border border-amber-300 dark:border-amber-700'
                          : 'hover:bg-white/60 dark:hover:bg-slate-800/80 text-slate-400 hover:text-amber-500'
                      }`}
                      title={routine.isFavorite ? 'Remove priority favorite' : 'Set as top priority favorite'}
                    >
                      <Star className={`w-3.5 h-3.5 ${routine.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    {/* Add Entire Routine to Plan */}
                    <button
                      onClick={() => onAddRoutineToPlan(routine.id)}
                      className="p-1.5 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-white text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center space-x-1 shadow-2xs transition-all shrink-0"
                      title="Add all steps of this routine to My Plan"
                    >
                      <Plus className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                      <span className="text-[11px] font-semibold hidden md:inline">Add All</span>
                    </button>

                    {/* Edit Routine */}
                    <button
                      onClick={() => onEditRoutineModal(routine)}
                      className="p-1.5 rounded-md hover:bg-white/60 dark:hover:bg-slate-800/80 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
                      title="Edit Routine"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Routine */}
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-600 shrink-0"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle expand */}
                    <button
                      onClick={() => toggleExpand(routine.id)}
                      className="p-1.5 rounded-md hover:bg-white/60 text-slate-500 shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Routine Steps List (Draggable individual steps) */}
              {isExpanded && (
                <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 pt-1 space-y-1.5 border-t border-slate-200/50 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40">
                  {routine.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      draggable
                      onDragStart={(e) => onDragStartStep(e, routine, step)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-xs transition-all group/step min-w-0"
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
                        <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover/step:text-cyan-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-400 w-4 text-right shrink-0">
                          {idx + 1}.
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap leading-tight">
                          {step.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddStepToPlan(routine.id, step.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-cyan-100 dark:hover:bg-cyan-950/80 active:bg-cyan-200 dark:active:bg-cyan-900 text-cyan-600 dark:text-cyan-400 shrink-0 transition-all border border-slate-200/60 dark:border-slate-600/50"
                        title="Añadir paso a Mi Plan"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          💡 Drag any routine or step onto <strong>My Plan</strong> to interleave them.
        </p>
      </div>

    </div>
  );
};
