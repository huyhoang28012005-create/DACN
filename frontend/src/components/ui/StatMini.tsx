export function StatMini({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  bgColor?: string;
}) {
  const highlightClass = bgColor ? `${bgColor}/10` : 'bg-slate-50/50 dark:bg-slate-800/30';

  return (
    <div className="bg-white/50 dark:bg-slate-800/20 backdrop-blur-md p-4 rounded-2xl border border-[#E0E0E0]/50 dark:border-slate-800/50 shadow-sm flex items-center justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {bgColor && (
        <div
          className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${bgColor} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}
        ></div>
      )}
      <div className="relative z-10">
        <div className="text-[12px] text-[#757575] dark:text-slate-400 font-medium mb-1">
          {label}
        </div>
        <div className={`text-[20px] font-bold text-[#212121] dark:text-slate-100`}>{value}</div>
      </div>
      <div className={`p-2 rounded-xl ${highlightClass} ${color} backdrop-blur-sm relative z-10`}>
        {icon}
      </div>
    </div>
  );
}
