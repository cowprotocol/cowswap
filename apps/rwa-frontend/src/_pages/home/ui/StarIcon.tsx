import type { ReactNode } from 'react'

interface StarIconProps {
  filled: boolean
}

export function StarIcon({ filled }: StarIconProps): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="m8 1.5 1.96 4.1 4.5.56-3.3 3.12.85 4.46L8 11.56l-4.01 2.18.85-4.46-3.3-3.12 4.5-.56L8 1.5Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
