import type { ReactNode } from 'react'

export function ChevronDownIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="12" height="7" viewBox="0 0 12.4673 7" fill="none" aria-hidden="true">
      <path
        d="M1 1L6.23364 6L11.4673 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
