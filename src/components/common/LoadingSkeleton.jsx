import React from 'react';

export default function LoadingSkeleton({ className = "h-4 w-full", count = 1 }) {
  if (count === 1) {
    return (
      <div className={`animate-pulse bg-slate-200 dark:bg-navy-800 rounded ${className}`} />
    );
  }

  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-slate-200 dark:bg-navy-800 rounded ${className}`} />
      ))}
    </div>
  );
}
