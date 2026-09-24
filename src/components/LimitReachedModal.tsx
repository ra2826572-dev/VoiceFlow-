import React from 'react';
import { X, Zap, Crown, AlertCircle } from 'lucide-react';
import { FeatureUsageType } from '../types';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureUsageType;
  featureName: string;
  limit: number;
  onUpgrade: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  isOpen,
  onClose,
  feature,
  featureName,
  limit,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        {/* Header Illustration */}
        <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 flex items-center justify-center">
          <div className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer" onClick={onClose}>
            <X size={20} />
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Free Limit Reached
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            You've used all <span className="font-semibold text-slate-900 dark:text-white">{limit}</span> available FREE usage for <span className="font-medium">{featureName}</span>.
          </p>

          <div className="mb-8 flex flex-col gap-3">
            <button
              onClick={onUpgrade}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95"
            >
              <Crown className="h-5 w-5" />
              Upgrade to Pro
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 px-6 py-3 font-medium text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Maybe Later
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
            <Zap className="h-4 w-4" />
            <span>Pro users get higher limits and premium features.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
