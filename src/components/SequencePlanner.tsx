import React, { useState } from 'react';
import { PlanItem, StepStatus, DraggedSource } from '../types';
import { getColorStyles, getStatusDetails } from '../utils/helpers';
import {
  GripVertical,
  CheckCircle2,
  Clock,
  MinusCircle,
  Circle,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Shuffle,
  Plus,
  RotateCcw,
  Share2,
  Check,
  Edit3,
} from 'lucide-react';

interface SequencePlannerProps {
  planItems: PlanItem[];
  onUpdateStepStatus: (itemId: string, status: StepStatus) => void;
  onUpdateStepTitle: (itemId: string, newTitle: string) => void;
  onMoveItem: (fromIndex: number, toIndex: number) => void;
  onDuplicateItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearPlan: () => void;
  onDropOnPlanIndex: (targetIndex: number) => void;
  draggedSource: DraggedSource | null;
  setDraggedSource: (source: DraggedSource | null) => void;
  onOpenInterleaveMixer: () => void;
}

export const SequencePlanner: React.FC<SequencePlannerProps> = ({
  planItems,
  onUpdateStepStatus,
  onUpdateStepTitle,
  onMoveItem,
  onDuplicateItem,
  onRemoveItem,
  onClearPlan,
  onDropOnPlanIndex,
  draggedSource,
  setDraggedSource,
  onOpenInterleaveMixer,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Drag event handlers
  const handleDragOverSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeaveSlot = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropSlot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    onDropOnPlanIndex(index);
    setDragOverIndex(null);
  };

  const handleDragStartPlanItem = (e: React.DragEvent, index: number) => {
    setDraggedSource({
      type: 'plan_item',
      planIndex: index,
    });
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', `plan_item:${index}`);
    } catch {}
  };

  const handleStartEditing = (item: PlanItem) => {
    setEditingItemId(item.id);
    setEditingTitle(item.stepTitle);
  };

  const handleSaveTitle = (itemId: string) => {
    if (editingTitle.trim()) {
      onUpdateStepTitle(itemId, editingTitle.trim());
    }
    setEditingItemId(null);
  };

  const handleCopySequenceText = () => {
    if (planItems.length === 0) return;
    const textLines = planItems.map((item, idx) => {
      const statusSymbol =
        item.status === 'completed'
          ? '[✓ Completed]'
          : item.status === 'in_progress'
          ? '[◉ In Progress]'
          : item.status === 'skipped'
          ? '[— Skipped]'
          : '[○ Pending]';
      return `${idx + 1}. ${item.stepTitle} — ${item.routineIcon} ${item.routineTitle} ${statusSymbol}`;
    });

    const fullText = `MY PLAN (SEQUENCE EXECUTION):\n\n` + textLines.join('\n');
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredItems = planItems.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 sm:space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              MY PLAN
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Sequence Execution
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            "What do I do first, what do I do next, what do I do after that?" — No timestamps required.
          </p>
        </div>

        {/* Plan Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          {/* Copy Text Export */}
          {planItems.length > 0 && (
            <button
              onClick={handleCopySequenceText}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center space-x-1 transition-colors"
              title="Copy Sequence as plain text"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-cyan-500" />}
              <span>{isCopied ? 'Copied!' : 'Copy Plan'}</span>
            </button>
          )}

          {/* Interleave Assistant Button */}
          <button
            onClick={onOpenInterleaveMixer}
            className="px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center space-x-1 transition-colors shadow-2xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-purple-500" />
            <span>Mix Routines</span>
          </button>

          {planItems.length > 0 && (
            <button
              onClick={onClearPlan}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/60 text-slate-500 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Clear all steps from My Plan"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-xs font-medium border-b border-slate-100 dark:border-slate-800/80 pb-2 overflow-x-auto no-scrollbar max-w-full">
        <div className="flex space-x-1 shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            All ({planItems.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${
              filter === 'pending'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Pending ({planItems.filter((i) => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${
              filter === 'in_progress'
                ? 'bg-amber-500 text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            In Progress ({planItems.filter((i) => i.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg transition-colors font-bold ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Done ({planItems.filter((i) => i.status === 'completed').length})
          </button>
        </div>

        <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
          ↕ Reorder anytime with drag or arrows
        </span>
      </div>

      {/* Main Drag-and-Drop Sequence List */}
      <div className="space-y-2 min-h-[300px]">
        {/* Slot 0 (Top insertion target) */}
        <div
          onDragOver={(e) => handleDragOverSlot(e, 0)}
          onDrop={(e) => handleDropSlot(e, 0)}
          className={`h-2 rounded transition-all duration-150 flex items-center justify-center ${
            dragOverIndex === 0
              ? 'h-10 bg-cyan-100 dark:bg-cyan-950 border-2 border-dashed border-cyan-500 my-1'
              : ''
          }`}
        >
          {dragOverIndex === 0 && (
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center space-x-1">
              <Plus className="w-4 h-4" />
              <span>Drop here (Position 1)</span>
            </span>
          )}
        </div>

        {planItems.length === 0 ? (
          <div
            onDragOver={(e) => handleDragOverSlot(e, 0)}
            onDrop={(e) => handleDropSlot(e, 0)}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 sm:p-12 text-center space-y-4 hover:border-cyan-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
              <Shuffle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                My Plan is currently empty
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Drag and drop routines or individual steps here, or use the <strong>Mix Routines</strong> tool to generate an interleaved sequence!
              </p>
            </div>
            <button
              onClick={onOpenInterleaveMixer}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Interleave Routines</span>
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            // Find real index in original planItems
            const realIndex = planItems.findIndex((i) => i.id === item.id);
            const colorStyles = getColorStyles(item.routineColor);
            const statusDetails = getStatusDetails(item.status);

            return (
              <React.Fragment key={item.id}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStartPlanItem(e, realIndex)}
                  className={`group relative rounded-xl border p-3 sm:p-4 bg-white dark:bg-slate-800/90 shadow-2xs hover:shadow-md transition-all duration-200 ${
                    item.status === 'completed'
                      ? 'border-slate-200 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/50'
                      : item.status === 'in_progress'
                      ? 'border-amber-400 dark:border-amber-500/80 ring-2 ring-amber-400/20'
                      : 'border-slate-200/90 dark:border-slate-700/80 hover:border-cyan-400 dark:hover:border-cyan-500'
                  }`}
                >
                  {/* Dedicated Mobile Quick Delete Button in Top Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item.id);
                    }}
                    className="sm:hidden absolute top-3 right-3 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60 dark:border-red-900/50 transition-colors z-10"
                    title="Remove from My Plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Position Number, Drag Handle, Step Title, Routine Badge */}
                    <div className="flex items-center space-x-3 min-w-0 pr-8 sm:pr-0">
                      
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing p-1 rounded text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Sequential Position Number (1., 2., 3...) */}
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-sm text-slate-700 dark:text-slate-200 shrink-0">
                        {realIndex + 1}
                      </div>

                      {/* Step Details */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center space-x-1 ${colorStyles.badgeBg} ${colorStyles.border}`}
                          >
                            <span>{item.routineIcon}</span>
                            <span>{item.routineTitle}</span>
                          </span>

                          {/* Quick Status Tag */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusDetails.badgeClass}`}>
                            {statusDetails.symbol} {statusDetails.label}
                          </span>
                        </div>

                        {editingItemId === item.id ? (
                          <div className="flex items-center space-x-1 mt-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle(item.id);
                                if (e.key === 'Escape') setEditingItemId(null);
                              }}
                              autoFocus
                              className="px-2 py-0.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 border border-cyan-500 rounded text-slate-900 dark:text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveTitle(item.id)}
                              className="px-2 py-0.5 text-[10px] font-bold bg-cyan-600 text-white rounded hover:bg-cyan-500"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1.5 group/title">
                            <p
                              onClick={() => handleStartEditing(item)}
                              className={`text-sm font-bold text-slate-900 dark:text-white leading-tight cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors ${
                                item.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                              }`}
                              title="Click to edit step name in My Plan"
                            >
                              {item.stepTitle}
                            </p>
                            <button
                              onClick={() => handleStartEditing(item)}
                              className="opacity-100 sm:opacity-0 sm:group-hover/title:opacity-100 p-0.5 text-slate-400 hover:text-cyan-500 transition-opacity"
                              title="Edit step name"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right: Actions & Status Controls */}
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-700/50">
                      
                      {/* Status Toggle Buttons */}
                      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800 overflow-x-auto max-w-full">
                        
                        <button
                          onClick={() => onUpdateStepStatus(item.id, 'pending')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                            item.status === 'pending'
                              ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                          title="Mark Pending"
                        >
                          Pending
                        </button>

                        <button
                          onClick={() => onUpdateStepStatus(item.id, 'in_progress')}
                          className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                            item.status === 'in_progress'
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
                          }`}
                          title="Mark In Progress"
                        >
                          In Progress
                        </button>

                        <button
                          onClick={() => onUpdateStepStatus(item.id, 'completed')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                            item.status === 'completed'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                          title="Mark Completed"
                        >
                          ✓ Done
                        </button>

                        <button
                          onClick={() => onUpdateStepStatus(item.id, 'skipped')}
                          className={`px-1.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                            item.status === 'skipped'
                              ? 'bg-slate-700 text-white shadow-2xs'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title="Skip Step"
                        >
                          Skip
                        </button>

                      </div>

                      {/* Reorder Up/Down Arrow Buttons & Extra Actions */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onMoveItem(realIndex, realIndex - 1)}
                          disabled={realIndex === 0}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Up in sequence"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onMoveItem(realIndex, realIndex + 1)}
                          disabled={realIndex === planItems.length - 1}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move Down in sequence"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateItem(item.id)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-purple-600 transition-colors"
                          title="Duplicate Step"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button (Desktop & Tablet) */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="hidden sm:inline-flex p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove from My Plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Drop Slot Indicator after each item */}
                <div
                  onDragOver={(e) => handleDragOverSlot(e, realIndex + 1)}
                  onDrop={(e) => handleDropSlot(e, realIndex + 1)}
                  className={`h-2 rounded transition-all duration-150 flex items-center justify-center ${
                    dragOverIndex === realIndex + 1
                      ? 'h-10 bg-cyan-100 dark:bg-cyan-950 border-2 border-dashed border-cyan-500 my-1'
                      : ''
                  }`}
                >
                  {dragOverIndex === realIndex + 1 && (
                    <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center space-x-1">
                      <Plus className="w-4 h-4" />
                      <span>Drop here (Position {realIndex + 2})</span>
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

    </div>
  );
};
