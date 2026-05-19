import React from 'react';
import { cn } from '../../lib/utils';
import { TaskStatus } from '../../types';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  status?: TaskStatus;
  variant?: 'outline' | 'default';
  className?: string;
  children?: React.ReactNode;
};

export function Badge({ className, status, variant = 'default', children, ...props }: BadgeProps) {
  let statusClasses = '';
  
  if (status === 'OK') statusClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (status === 'Due Soon') statusClasses = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (status === 'Expired') statusClasses = 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
  
  const outlineClasses = variant === 'outline' ? 'border border-border dark:border-border-dark bg-transparent text-text-muted dark:text-text-muted-dark' : '';

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
        statusClasses || outlineClasses || "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300",
        className
      )} 
      {...props}
    >
      {children}
    </span>
  );
}
