import type { ReactNode } from 'react'

export function PencilIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.8 2.6a1.6 1.6 0 0 1 2.3 0l.3.3a1.6 1.6 0 0 1 0 2.3L6 12.6l-3.3.7.7-3.3 7.4-7.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M9.6 3.8l2.6 2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
