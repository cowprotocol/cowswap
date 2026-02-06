import type { RefObject } from 'react'

import { SmartModal } from '../SmartModal'
import type { SmartModalProps } from '../SmartModal'
import { Media } from '../../consts'

export interface ModalProps
  extends Omit<SmartModalProps, 'anchorRef' | 'containerId' | 'drawerMediaQuery'> {
  /** Media query string for when to show as bottom drawer. Defaults to small screens. */
  drawerMediaQuery?: string
}

/**
 * Preset SmartModal with no anchor and no containerId.
 * Renders as a centered modal on desktop and as a bottom drawer (swipe-down to close) when drawerMediaQuery matches.
 */
export function Modal({
  drawerMediaQuery = Media.upToSmall(false),
  showBackdrop = true,
  ...rest
}: ModalProps): React.JSX.Element | null {
  return (
    <SmartModal
      {...rest}
      anchorRef={undefined}
      containerId={undefined}
      drawerMediaQuery={drawerMediaQuery}
      showBackdrop={showBackdrop}
    />
  )
}
