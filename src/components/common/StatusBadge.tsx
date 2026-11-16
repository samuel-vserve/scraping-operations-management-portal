import React from 'react';
import { TaskStatus } from '../../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending_assignment':
        return {
          label: 'Pending Assignment',
          bg: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
          dot: 'bg-slate-400',
          border: 'border-slate-200 dark:border-zinc-700',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
          dot: 'bg-blue-500 animate-pulse',
          border: 'border-blue-200 dark:border-blue-800',
        };
      case 'awaiting_manager_qc':
        return {
          label: 'Awaiting QC',
          bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
          dot: 'bg-indigo-500',
          border: 'border-indigo-200 dark:border-indigo-800',
        };
      case 'rework_required':
        return {
          label: 'Rework Required',
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          dot: 'bg-amber-500',
          border: 'border-amber-200 dark:border-amber-800',
        };
      case 'production_pending':
        return {
          label: 'Production Pending',
          bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
          dot: 'bg-purple-500',
          border: 'border-purple-200 dark:border-purple-800',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          dot: 'bg-emerald-500',
          border: 'border-emerald-200 dark:border-emerald-800',
        };
      case 'rejected':
        return {
          label: 'Rejected',
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
          dot: 'bg-rose-500',
          border: 'border-rose-200 dark:border-rose-800',
        };
      default:
        return {
          label: status,
          bg: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300',
          dot: 'bg-gray-400',
          border: 'border-gray-200 dark:border-zinc-700',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.border} ${sizeClasses} whitespace-nowrap transition-colors`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
