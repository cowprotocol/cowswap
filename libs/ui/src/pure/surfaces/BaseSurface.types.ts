import { ReactNode } from 'react'

export interface BaseSurfaceProps {
  className?: string
  /** Optional a11y title; rendered visually hidden. */
  a11yTitle?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}
