import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
    period?: string;
  };
  icon: LucideIcon;
  iconColor?: string;
  sparklineData?: number[];
  onClick?: () => void;
  active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon: Icon,
  iconColor = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900',
  sparklineData = [12, 14, 11, 15, 18, 16, 22, 24],
  onClick,
  active = false,
}) => {
  // Generate simple sparkline SVG path
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;
  const width = 80;
  const height = 28;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = trend?.isPositive ? '#10b981' : '#6366f1';

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${
        active
          ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
          : 'bg-card border-border hover:border-slate-300 dark:hover:border-zinc-700 shadow-subtle hover:shadow-premium'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 line-clamp-1">
          {label}
        </span>
        <div className={`p-2 rounded-lg border shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 mt-1">
        <div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {trend && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-0.5 font-medium ${
                  trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                {trend.period || 'vs last week'}
              </span>
            </div>
          )}
        </div>

        {/* Sparkline mini chart */}
        <div className="w-20 h-7 opacity-75 group-hover:opacity-100 transition-opacity">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <polyline
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
