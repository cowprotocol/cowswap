import { ReactNode } from 'react'

export interface BaseSurfaceProps {
  className?: string
  /**
   * Optional Base UI Title text (visually hidden). Only when there is no visible
   * `ModalHeader` with `titleAs={Dialog.Title}` / `BottomDrawer.Title`.
   */
  a11yTitle?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}
