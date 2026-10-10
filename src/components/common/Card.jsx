import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  bodyClassName = 'p-5',
  headerClassName = 'p-5 pb-3',
  variant = 'default',
  footer,
  ...props
}) {
  const variantStyles = {
    default: "bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm",
    flat: "bg-slate-50 dark:bg-navy-850 border border-slate-200 dark:border-navy-700",
    elevated: "bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-md",
    weather: "bg-gradient-to-b from-weather-500/5 to-transparent border border-weather-500/20 dark:bg-navy-900",
    energy: "bg-gradient-to-b from-energy-500/5 to-transparent border border-energy-500/20 dark:bg-navy-900"
  };

  return (
    <div
      className={`rounded-xl transition-all duration-150 overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {(title || subtitle || action || Icon) && (
        <div className={`flex items-start justify-between border-b border-slate-100 dark:border-navy-800/80 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
      {footer && (
        <div className="px-5 py-3 bg-slate-50/70 dark:bg-navy-850/50 border-t border-slate-100 dark:border-navy-800/80 text-xs text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
