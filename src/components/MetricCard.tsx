import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'slate';
  icon: LucideIcon;
  iconBg?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  badgeColor = 'cyan',
  icon: Icon
}) => {
  const badgeStyles = {
    emerald: 'bg-[#e6f4ea] text-[#137333]',
    amber: 'bg-[#fef7e0] text-[#b06000]',
    rose: 'bg-[#fce8e6] text-[#c5221f]',
    cyan: 'bg-[#fbe1d1] text-[#5d2a1a]',
    indigo: 'bg-[#f2f2f3] text-[#17191c]',
    slate: 'bg-[#f2f2f3] text-[#777b86]'
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#ececec] p-5 shadow-[0_0_0_1px_rgba(4,23,43,0.04),0_12px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-normal text-[#979799] tracking-normal">{title}</p>
          <h3 className="text-2xl lg:text-[26px] font-semibold text-[#17191c] mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-2.5 rounded-full bg-[#f2f2f3] text-[#17191c]">
          <Icon className="w-4 h-4 text-[#17191c]" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="mt-4 pt-3 border-t border-[#f2f2f3] flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#777b86] font-normal text-[12px]">{subtitle}</span>}
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badgeStyles[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

