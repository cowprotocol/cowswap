import type { ReactNode } from 'react'

export function SearchIcon({ className }: { className?: string }): ReactNode {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M7.33333 12C9.91066 12 12 9.91066 12 7.33333C12 4.756 9.91066 2.66667 7.33333 2.66667C4.756 2.66667 2.66667 4.756 2.66667 7.33333C2.66667 9.91066 4.756 12 7.33333 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.3333 13.3333L11 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
