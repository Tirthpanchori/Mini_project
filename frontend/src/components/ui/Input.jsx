
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none transition-all duration-200",
            "focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            Icon && "pl-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-sm text-red-500 animate-fade-in flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-500 inline-block"/>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
