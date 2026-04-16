import { ReactNode } from 'react'

export interface SlotProps {
  propName: string
  variant: 'block' | 'inline'
}

/** Placeholder for slot/children props in Cosmos; shows prop name and flows as block or inline. */
export function Slot({ propName, variant }: SlotProps): ReactNode {
  const shared = {
    border: '1px dashed currentColor',
    padding: '6px 10px',
    fontSize: 12,
    opacity: 0.85,
  }
  if (variant === 'block') {
    return (
      <div style={{ ...shared, display: 'block' }} title={propName}>
        {propName}
      </div>
    )
  }
  return (
    <span style={{ ...shared, display: 'inline-block' }} title={propName}>
      {propName}
    </span>
  )
}
