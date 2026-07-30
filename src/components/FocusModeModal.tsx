import React, { useEffect, useState } from 'react';
import { PlanItem, StepStatus } from '../types';
import { getColorStyles, getStatusDetails } from '../utils/helpers';
import {
  X,
  CheckCircle2,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  RotateCcw,
  Play,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PlanItem[];
  currentIndex: number;
  onUpdateStepStatus: (itemId: string, status: StepStatus) => void;
  onSetCurrentIndex: (index: number) => void;
  onResetAllStatus: () => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onUpdateStepStatus,
  onSetCurrentIndex,
  onResetAllStatus,
}) => {
  const { t, translateText } = useLanguage();

  if (!isOpen) return null;

  const total = items.length;
  const currentItem = items[currentIndex];
  const colorStyles = currentItem ? getColorStyles(currentItem.routineColor) : null;
  const statusDetails = currentItem ? getStatusDetails(currentItem.status) : null;

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const isAllComplete = total > 0 && completedCount === total;

  // Auto advance helper
  const handleMarkCompleteAndNext = () => {
    if (!currentItem) return;
    onUpdateStepStatus(currentItem.id, 'completed');
    if (currentIndex < total - 1) {
      onSetCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkipAndNext = () => {
    if (!currentItem) return;
    onUpdateStepStatus(currentItem.id, 'skipped');
    if (currentIndex < total - 1) {
      onSetCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onSetCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      onSetCurrentIndex(currentIndex + 1);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleMarkCompleteAndNext();
      } else if (e.key === 's' || e.key === 'S') {
        handleSkipAndNext();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 relative my-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-sm font-black tracking-widest text-emerald-400 uppercase">
              {t('focusModeTitle')}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title={t('exitFocusMode')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isAllComplete ? (
          /* All steps completed celebrate view */
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white">
                {t('sequenceCompleted')}
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                {t('sequenceCompletedDesc', { total })}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={onResetAllStatus}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center space-x-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('restartSequence')}</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all"
              >
                {t('returnToPlan')}
              </button>
            </div>
          </div>
        ) : currentItem ? (
          /* Active step focus card */
          <div className="space-y-8 text-center">
            
            {/* Step Counter */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                {t('stepXofY', { current: currentIndex + 1, total })}
              </p>

              {/* Progress bar line */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden max-w-xs mx-auto mt-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Giant Active Step Title */}
            <div className="py-4 space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                {translateText(currentItem.stepTitle)}
              </h1>

              {/* Routine Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold shadow-sm">
                <span className="text-xl">{currentItem.routineIcon}</span>
                <span>{translateText(currentItem.routineTitle)}</span>
              </div>
            </div>

            {/* Main Action Control Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              
              {/* COMPLETE Button */}
              <button
                onClick={handleMarkCompleteAndNext}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm tracking-wider uppercase shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('completeBtn')}</span>
              </button>

              {/* SKIP Button */}
              <button
                onClick={handleSkipAndNext}
                className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-extrabold text-sm tracking-wider uppercase border border-slate-700 flex items-center justify-center space-x-2 transition-all"
              >
                <SkipForward className="w-4 h-4" />
                <span>{t('skipBtn')}</span>
              </button>

              {/* NEXT Button */}
              <button
                onClick={handleNext}
                disabled={currentIndex === total - 1}
                className="w-full py-4 px-6 rounded-2xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 disabled:opacity-30 text-white font-black text-sm tracking-wider uppercase shadow-lg shadow-cyan-600/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>{t('nextBtn')}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

            </div>

            {/* Step Selector & Navigation Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="inline-flex items-center space-x-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t('previousStep')}</span>
              </button>

              <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                {items.map((it, idx) => (
                  <button
                    key={it.id}
                    onClick={() => onSetCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'bg-emerald-400 scale-125 ring-4 ring-emerald-400/20'
                        : it.status === 'completed'
                        ? 'bg-emerald-800'
                        : 'bg-slate-700'
                    }`}
                    title={`Step ${idx + 1}: ${translateText(it.stepTitle)}`}
                  />
                ))}
              </div>

              <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
                {t('shortcuts')}
              </span>
            </div>

          </div>
        ) : (
          <p className="text-center text-slate-400">{t('noActiveStep')}</p>
        )}

      </div>
    </div>
  );
};

