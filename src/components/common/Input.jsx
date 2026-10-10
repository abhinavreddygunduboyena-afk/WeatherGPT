import React from 'react';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150
            bg-white dark:bg-navy-900 
            text-slate-900 dark:text-slate-100 
            placeholder-slate-400 dark:placeholder-slate-500
            ${Icon ? 'pl-9' : 'pl-3.5'} pr-3.5 py-2
            ${error 
              ? 'border-red-400 dark:border-red-600 focus:ring-2 focus:ring-red-500/30 focus:border-red-500' 
              : 'border-slate-300 dark:border-navy-700 focus:ring-2 focus:ring-weather-500/20 focus:border-weather-500 dark:focus:border-weather-400'
            }
            focus:outline-none disabled:bg-slate-50 dark:disabled:bg-navy-950 disabled:opacity-60 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}
