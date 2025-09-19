import * as React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={
        'animate-pulse rounded-md bg-slate-200/70 dark:bg-charcoal-500/50 ' +
        className
      }
    />
  )
}

