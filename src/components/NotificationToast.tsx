import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  ArrowRight,
  Play
} from 'lucide-react';
import { notificationService } from '../lib/notificationService';
import { AppNotification } from '../types';
import { NavTab } from './Sidebar';

interface NotificationToastProps {
  onNavigate?: (runId: string, tab: NavTab) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const [toast, setToast] = useState<AppNotification | null>(null);
  const [progress, setProgress] = useState<number>(100);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((_list, activeToast) => {
      setToast(activeToast ? { ...activeToast } : null);
      setProgress(100);
    });

    return () => unsubscribe();
  }, []);

  // Progress bar animation (4500ms duration)
  useEffect(() => {
    if (!toast) return;
    const duration = 4500;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast]);

  if (!toast) return null;

  const getBorderAndBg = () => {
    switch (toast.type) {
      case 'complete':
        return 'border-emerald-500/50 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-emerald-500/10';
      case 'fail':
        return 'border-rose-500/50 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-rose-500/10';
      case 'warning':
        return 'border-amber-500/50 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-amber-500/10';
      case 'start':
        return 'border-indigo-500/50 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-indigo-500/10';
      case 'info':
      default:
        return 'border-blue-500/50 bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-blue-500/10';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case 'start':
        return <Play className="w-5 h-5 text-indigo-500 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
  };

  const getProgressBarColor = () => {
    switch (toast.type) {
      case 'complete':
        return 'bg-emerald-500';
      case 'fail':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      case 'start':
        return 'bg-indigo-500';
      case 'info':
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      id={`notification-toast-${toast.id}`}
      className="fixed bottom-5 right-5 z-50 max-w-md w-full sm:w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div
        onClick={() => {
          if (toast.runId && onNavigate) {
            const targetTab: NavTab = toast.type === 'start'
              ? 'live'
              : toast.title.toLowerCase().includes('report') || toast.title.toLowerCase().includes('zip')
              ? 'reports'
              : 'results';
            onNavigate(toast.runId, targetTab);
          }
          notificationService.dismissToast();
        }}
        className={`rounded-2xl border backdrop-blur-md shadow-2xl p-4 overflow-hidden relative transition-all duration-150 cursor-pointer hover:shadow-indigo-500/10 hover:border-indigo-400/60 active:scale-[0.99] ${getBorderAndBg()}`}
      >
        {/* Top Progress countdown */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800">
          <div
            className={`h-full transition-all ease-linear ${getProgressBarColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-start gap-3 mt-1">
          {getIcon()}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {toast.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notificationService.dismissToast();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {toast.message}
            </p>

            {/* Meta Tags & Action Pill */}
            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {toast.testType && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {toast.testType}
                  </span>
                )}
                {toast.rating && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    toast.rating === 'EXCELLENT'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : toast.rating === 'CRITICAL'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {toast.rating}
                  </span>
                )}
                {typeof toast.score === 'number' && (
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    Score: {toast.score.toFixed(0)}/100
                  </span>
                )}
              </div>

              {toast.runId && onNavigate && (
                <div
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
