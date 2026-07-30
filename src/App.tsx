import React, { useState, useEffect } from 'react';
import { Routine, PlanItem, StepStatus, DraggedSource } from './types';
import { INITIAL_ROUTINES, INITIAL_PLAN } from './data/defaultData';
import { generateId } from './utils/helpers';
import { Header } from './components/Header';
import { ProgressBar } from './components/ProgressBar';
import { RoutineLibrary } from './components/RoutineLibrary';
import { SequencePlanner } from './components/SequencePlanner';
import { FocusModeModal } from './components/FocusModeModal';
import { InterleaveMixerModal } from './components/InterleaveMixerModal';
import { RoutineModal } from './components/RoutineModal';

export default function App() {
  // LocalStorage state initialization
  const [routines, setRoutines] = useState<Routine[]>(() => {
    try {
      const saved = localStorage.getItem('seq_planner_routines');
      return saved ? JSON.parse(saved) : INITIAL_ROUTINES;
    } catch {
      return INITIAL_ROUTINES;
    }
  });

  const [planItems, setPlanItems] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem('seq_planner_items');
      return saved ? JSON.parse(saved) : INITIAL_PLAN;
    } catch {
      return INITIAL_PLAN;
    }
  });

  // UI state
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusStepIndex, setFocusStepIndex] = useState(0);
  const [isInterleaveMixerOpen, setIsInterleaveMixerOpen] = useState(false);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [routineToEdit, setRoutineToEdit] = useState<Routine | null>(null);

  // Drag & drop state
  const [draggedSource, setDraggedSource] = useState<DraggedSource | null>(null);

  // Save to LocalStorage on state update
  useEffect(() => {
    try {
      localStorage.setItem('seq_planner_routines', JSON.stringify(routines));
    } catch (e) {
      console.error('Failed to save routines', e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem('seq_planner_items', JSON.stringify(planItems));
    } catch (e) {
      console.error('Failed to save plan items', e);
    }
  }, [planItems]);

  // Routine & Plan actions
  const handleAddRoutineToPlan = (routineId: string, targetIndex?: number) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;

    const newItems: PlanItem[] = routine.steps.map((step) => ({
      id: generateId('plan'),
      routineId: routine.id,
      routineTitle: routine.title,
      routineIcon: routine.icon,
      routineColor: routine.color,
      stepId: step.id,
      stepTitle: step.title,
      status: 'pending',
    }));

    setPlanItems((prev) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const copy = [...prev];
        copy.splice(targetIndex, 0, ...newItems);
        return copy;
      }
      return [...prev, ...newItems];
    });
  };

  const handleAddStepToPlan = (routineId: string, stepId: string, targetIndex?: number) => {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    const step = routine.steps.find((s) => s.id === stepId);
    if (!step) return;

    const newItem: PlanItem = {
      id: generateId('plan'),
      routineId: routine.id,
      routineTitle: routine.title,
      routineIcon: routine.icon,
      routineColor: routine.color,
      stepId: step.id,
      stepTitle: step.title,
      status: 'pending',
    };

    setPlanItems((prev) => {
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const copy = [...prev];
        copy.splice(targetIndex, 0, newItem);
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateStepStatus = (itemId: string, status: StepStatus) => {
    setPlanItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );
  };

  const handleUpdateStepTitle = (itemId: string, newTitle: string) => {
    setPlanItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, stepTitle: newTitle } : item))
    );
  };

  const handleToggleFavoriteRoutine = (routineId: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === routineId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleOpenFocusMode = () => {
    let idx = planItems.findIndex((i) => i.status === 'in_progress');
    if (idx === -1) {
      idx = planItems.findIndex((i) => i.status === 'pending');
    }
    setFocusStepIndex(idx !== -1 ? idx : 0);
    setIsFocusModeOpen(true);
  };

  const handleMoveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= planItems.length) return;
    if (toIndex < 0 || toIndex >= planItems.length) return;

    setPlanItems((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      return copy;
    });
  };

  const handleDuplicateItem = (itemId: string) => {
    const index = planItems.findIndex((i) => i.id === itemId);
    if (index === -1) return;
    const original = planItems[index];

    const duplicate: PlanItem = {
      ...original,
      id: generateId('plan'),
      status: 'pending',
    };

    setPlanItems((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicate);
      return copy;
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setPlanItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearPlan = () => {
    if (window.confirm('Are you sure you want to clear all steps from My Plan?')) {
      setPlanItems([]);
    }
  };

  const handleResetPlanToDefault = () => {
    if (window.confirm('Reset My Plan to the default interleaved sample sequence?')) {
      setPlanItems(INITIAL_PLAN);
      setRoutines(INITIAL_ROUTINES);
    }
  };

  const handleResetAllStatus = () => {
    setPlanItems((prev) => prev.map((item) => ({ ...item, status: 'pending' })));
    setFocusStepIndex(0);
  };

  // Drag drop handler when item is dropped at targetIndex in My Plan
  const handleDropOnPlanIndex = (targetIndex: number) => {
    if (!draggedSource) return;

    if (draggedSource.type === 'routine' && draggedSource.routineId) {
      handleAddRoutineToPlan(draggedSource.routineId, targetIndex);
    } else if (
      draggedSource.type === 'routine_step' &&
      draggedSource.routineId &&
      draggedSource.stepId
    ) {
      handleAddStepToPlan(draggedSource.routineId, draggedSource.stepId, targetIndex);
    } else if (
      draggedSource.type === 'plan_item' &&
      typeof draggedSource.planIndex === 'number'
    ) {
      const fromIdx = draggedSource.planIndex;
      let finalToIdx = targetIndex;
      if (fromIdx < targetIndex) {
        finalToIdx = targetIndex - 1;
      }
      handleMoveItem(fromIdx, finalToIdx);
    }

    setDraggedSource(null);
  };

  // Drag start handlers from Routine Library
  const handleDragStartRoutine = (e: React.DragEvent, routine: Routine) => {
    setDraggedSource({
      type: 'routine',
      routineId: routine.id,
    });
    e.dataTransfer.effectAllowed = 'copy';
    try {
      e.dataTransfer.setData('text/plain', `routine:${routine.id}`);
    } catch {}
  };

  const handleDragStartStep = (
    e: React.DragEvent,
    routine: Routine,
    step: { id: string; title: string }
  ) => {
    setDraggedSource({
      type: 'routine_step',
      routineId: routine.id,
      stepId: step.id,
    });
    e.dataTransfer.effectAllowed = 'copy';
    try {
      e.dataTransfer.setData('text/plain', `step:${routine.id}:${step.id}`);
    } catch {}
  };

  // Routine Modal handlers
  const handleSaveRoutine = (savedRoutine: Routine) => {
    setRoutines((prev) => {
      const exists = prev.some((r) => r.id === savedRoutine.id);
      if (exists) {
        return prev.map((r) => (r.id === savedRoutine.id ? savedRoutine : r));
      }
      return [...prev, savedRoutine];
    });
  };

  const handleDeleteRoutine = (routineId: string) => {
    if (window.confirm('Delete this routine template? Existing plan items will remain.')) {
      setRoutines((prev) => prev.filter((r) => r.id !== routineId));
    }
  };

  const completedSteps = planItems.filter((i) => i.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white flex flex-col">
      
      {/* Top Navbar */}
      <Header
        onOpenFocusMode={handleOpenFocusMode}
        onOpenInterleaveMixer={() => setIsInterleaveMixerOpen(true)}
        onOpenNewRoutine={() => {
          setRoutineToEdit(null);
          setIsRoutineModalOpen(true);
        }}
        onResetPlan={handleResetPlanToDefault}
        totalSteps={planItems.length}
        completedSteps={completedSteps}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
        
        {/* Progress Banner */}
        <ProgressBar
          items={planItems}
          onOpenFocusMode={handleOpenFocusMode}
          onFocusStepIndex={(index) => setFocusStepIndex(index)}
        />

        {/* Responsive Grid: Routines Sidebar (1 Col) + Sequence Planner (2 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          {/* Routine Library Column */}
          <div className="lg:col-span-4">
            <RoutineLibrary
              routines={routines}
              onAddRoutineToPlan={(rId) => handleAddRoutineToPlan(rId)}
              onAddStepToPlan={(rId, sId) => handleAddStepToPlan(rId, sId)}
              onToggleFavoriteRoutine={handleToggleFavoriteRoutine}
              onOpenNewRoutineModal={() => {
                setRoutineToEdit(null);
                setIsRoutineModalOpen(true);
              }}
              onEditRoutineModal={(routine) => {
                setRoutineToEdit(routine);
                setIsRoutineModalOpen(true);
              }}
              onDeleteRoutine={handleDeleteRoutine}
              onDragStartRoutine={handleDragStartRoutine}
              onDragStartStep={handleDragStartStep}
            />
          </div>

          {/* Sequence Planner (MY PLAN) Column */}
          <div className="lg:col-span-8">
            <SequencePlanner
              planItems={planItems}
              onUpdateStepStatus={handleUpdateStepStatus}
              onUpdateStepTitle={handleUpdateStepTitle}
              onMoveItem={handleMoveItem}
              onDuplicateItem={handleDuplicateItem}
              onRemoveItem={handleRemoveItem}
              onClearPlan={handleClearPlan}
              onDropOnPlanIndex={handleDropOnPlanIndex}
              draggedSource={draggedSource}
              setDraggedSource={setDraggedSource}
              onOpenInterleaveMixer={() => setIsInterleaveMixerOpen(true)}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          Sequence Planner — Organize tasks by position, mix routines seamlessly, and execute step by step.
        </p>
      </footer>

      {/* Focus Mode Overlay */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        items={planItems}
        currentIndex={focusStepIndex}
        onUpdateStepStatus={handleUpdateStepStatus}
        onSetCurrentIndex={(idx) => setFocusStepIndex(idx)}
        onResetAllStatus={handleResetAllStatus}
      />

      {/* Auto-Interleave Mixer Modal */}
      <InterleaveMixerModal
        isOpen={isInterleaveMixerOpen}
        onClose={() => setIsInterleaveMixerOpen(false)}
        routines={routines}
        onSetPlan={(newItems) => setPlanItems(newItems)}
      />

      {/* Create / Edit Routine Modal */}
      <RoutineModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        routineToEdit={routineToEdit}
        onSaveRoutine={handleSaveRoutine}
      />

    </div>
  );
}
