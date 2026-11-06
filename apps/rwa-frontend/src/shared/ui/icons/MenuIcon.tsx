import type { ReactNode } from 'react'

export function MenuIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
      <path d="M3 5.5h15M3 10.5h15M3 15.5h15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
