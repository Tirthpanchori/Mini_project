
import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ className, children, hoverEffect = false, ...props }) => {
  const hoverStyles = hoverEffect 
    ? "hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
    : "";

  return (
    <div 
      className={cn(
        "bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 p-6 overflow-hidden relative",
        hoverStyles,
        className
      )} 
      {...props}
    >
      {children} 
    </div>
  );
};
