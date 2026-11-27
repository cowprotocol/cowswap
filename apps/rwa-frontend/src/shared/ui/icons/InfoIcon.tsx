import type { ReactNode } from 'react'

export function InfoIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 7.2V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.9" fill="currentColor" />
    </svg>
  )
}
