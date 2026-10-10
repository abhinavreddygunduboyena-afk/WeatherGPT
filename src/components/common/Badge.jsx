import React from 'react';

export default function Badge({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
  dot = false,
  icon: Icon
}) {
  const sizeStyles = {
    sm: "text-[10px] px-1.5 py-0.5 font-medium tracking-wide",
    md: "text-xs px-2.5 py-1 font-medium",
    lg: "text-sm px-3 py-1 font-medium"
  };

  const variantStyles = {
    blue: "bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
    teal: "bg-teal-50 text-teal-700 border border-teal-200/60 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60",
    amber: "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
    red: "bg-red-50 text-red-700 border border-red-200/60 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60",
    slate: "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-navy-800 dark:text-slate-300 dark:border-navy-700",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60"
  };

  const dotColors = {
    blue: "bg-blue-500",
    teal: "bg-teal-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    slate: "bg-slate-400",
    emerald: "bg-emerald-500"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-current'}`} />}
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
