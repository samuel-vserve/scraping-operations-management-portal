import React from 'react';

interface TaskProgressProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  progress,
  showLabel = true,
  size = 'md',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const getColor = (val: number) => {
    if (val === 100) return 'bg-emerald-500';
    if (val > 60) return 'bg-indigo-600';
    if (val > 25) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ease-out ${getColor(clampedProgress)}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-zinc-400 min-w-[34px] text-right">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
};
