import type { ReactNode, RefObject } from 'react'

/**
 * 8 placement options for anchor-based positioning (aligned with Popper, without auto variants).
 * - top / top-start / top-end = top center / top left / top right
 * - bottom / bottom-start / bottom-end = bottom center / bottom left / bottom right
 * - left / right = left center / right center
 */
export type SmartModalPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'right'

export const SMART_MODAL_PLACEMENTS: readonly SmartModalPlacement[] = [
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'right',
] as const

export interface SmartModalProps {
  isOpen: boolean
  onDismiss: () => void
  children: ReactNode
  /** When set, position panel relative to this element using placement. */
  anchorRef?: RefObject<HTMLElement> | null
  /** When set, render into document.getElementById(containerId); layout handled by container. */
  containerId?: string | null
  /** Media query string (e.g. Media.upToSmall(false)); when matched, render as bottom drawer with swipe-down to close. */
  drawerMediaQuery: string
  /** For anchor mode. Default 'bottom'. */
  placement?: SmartModalPlacement
  /** Show backdrop in dropdown/modal mode. Default true for modal/drawer, configurable for dropdown. */
  showBackdrop?: boolean
  zIndex?: number
  className?: string
  /** For modal/drawer focus management. */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Min height (vh) for content panel in modal/drawer mode. */
  minHeight?: number | false
  /** Max height (vh) for content panel in modal/drawer mode. */
  maxHeight?: number
}
