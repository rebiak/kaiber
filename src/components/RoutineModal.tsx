import React, { useState, useEffect } from 'react';
import { Routine, RoutineStep } from '../types';
import { generateId } from '../utils/helpers';
import { X, Plus, Trash2, Layers, Save, Smile } from 'lucide-react';

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineToEdit: Routine | null;
  onSaveRoutine: (routine: Routine) => void;
}

const EMOJI_OPTIONS = ['🚿', '📚', '☕', '🧘', '💻', '🍳', '🏋️', '🎨', '🧹', '🚶', '🌱', '⚡'];
const COLOR_OPTIONS = [
  { id: 'cyan', label: 'Cyan / Shower' },
  { id: 'purple', label: 'Purple / Study' },
  { id: 'amber', label: 'Amber / Energy' },
  { id: 'emerald', label: 'Emerald / Health' },
  { id: 'rose', label: 'Rose / Passion' },
  { id: 'indigo', label: 'Indigo / Focus' },
];

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  routineToEdit,
  onSaveRoutine,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🚿');
  const [color, setColor] = useState('cyan');
  const [steps, setSteps] = useState<RoutineStep[]>([]);
  const [newStepTitle, setNewStepTitle] = useState('');

  useEffect(() => {
    if (routineToEdit) {
      setTitle(routineToEdit.title);
      setIcon(routineToEdit.icon);
      setColor(routineToEdit.color);
      setSteps([...routineToEdit.steps]);
    } else {
      setTitle('');
      setIcon('🚿');
      setColor('cyan');
      setSteps([
        { id: generateId('st'), title: 'First step' },
        { id: generateId('st'), title: 'Second step' },
      ]);
    }
  }, [routineToEdit, isOpen]);

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    setSteps([
      ...steps,
      {
        id: generateId('st'),
        title: newStepTitle.trim(),
      },
    ]);
    setNewStepTitle('');
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  const handleStepTitleChange = (stepId: string, newTitle: string) => {
    setSteps(
      steps.map((s) => (s.id === stepId ? { ...s, title: newTitle } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || steps.length === 0) return;

    const routine: Routine = {
      id: routineToEdit ? routineToEdit.id : generateId('routine'),
      title: title.trim(),
      icon,
      color,
      steps,
    };

    onSaveRoutine(routine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-300">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {routineToEdit ? 'EDIT ROUTINE TEMPLATE' : 'CREATE NEW ROUTINE'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title & Icon Pick */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Routine Title & Icon:
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xl cursor-pointer"
                >
                  {EMOJI_OPTIONS.map((emoji) => (
                    <option key={emoji} value={emoji}>
                      {emoji}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Take a Shower, English Study..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theme Color:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    color === c.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routine Steps */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Steps Sequence ({steps.length}):</span>
              <span className="text-[11px] text-slate-400 font-normal">Ordered list</span>
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepTitleChange(step.id, e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    required
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(step.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new step inline input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Add another step..."
                className="flex-1 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Save Routine</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
