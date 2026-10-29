import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'cyan' | 'purple';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'emerald',
  onClick,
}) => {
  const badgeStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const iconStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-neutral-900 border border-neutral-800 transition-all ${
        onClick
          ? 'hover:border-neutral-700 hover:bg-neutral-900/90 cursor-pointer group shadow-sm'
          : ''
      }`}
    >
      <div className="flex items-center justify-between text-neutral-400 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconStyles[badgeColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
          {value}
        </div>
        {badge && (
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-[11px] text-neutral-500 mt-1.5 font-mono">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
