import { ReactNode } from 'react'

/**
 * Inline rather than an asset: there's no chat glyph in @cowprotocol/assets, and a
 * stroke-based 16px icon inherits currentColor so it works in the header button
 * (both states) and the drawer title without three variants.
 */
export function ChatIcon({ size = 16 }: { size?: number }): ReactNode {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 4.2A1.7 1.7 0 0 1 3.7 2.5h8.6A1.7 1.7 0 0 1 14 4.2v5.1a1.7 1.7 0 0 1-1.7 1.7H6.6l-3.2 2.4a.4.4 0 0 1-.65-.32V11A1.7 1.7 0 0 1 2 9.3V4.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
