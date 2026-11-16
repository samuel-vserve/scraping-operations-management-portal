import React from 'react';
import { TaskPriority } from '../../types';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Urgent',
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
          icon: AlertCircle,
        };
      case 'high':
        return {
          label: 'High',
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
          icon: ArrowUp,
        };
      case 'medium':
        return {
          label: 'Medium',
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
          icon: ArrowRight,
        };
      case 'low':
        return {
          label: 'Low',
          bg: 'bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
          icon: ArrowDown,
        };
      default:
        return {
          label: priority,
          bg: 'bg-slate-50 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700',
          icon: ArrowRight,
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${config.bg} capitalize`}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      {config.label}
    </span>
  );
};
