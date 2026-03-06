import type { RefObject } from 'react'

import { SmartModal } from '../SmartModal'
import type { SmartModalPlacement, SmartModalProps } from '../SmartModal'
import { Media } from '../../consts'

type DropdownPropsBase = Omit<SmartModalProps, 'anchorRef' | 'containerId' | 'drawerMediaQuery'> & {
  /** Media query string for when to show as bottom drawer. Defaults to small screens. */
  drawerMediaQuery?: string
}

export type DropdownPropsWithAnchor = DropdownPropsBase & {
  anchorRef: RefObject<HTMLElement | null>
  containerId?: string | null
}

export type DropdownPropsWithContainer = DropdownPropsBase & {
  anchorRef?: RefObject<HTMLElement | null>
  containerId: string
}

export type DropdownProps = DropdownPropsWithAnchor | DropdownPropsWithContainer

/**
 * Preset SmartModal that requires either anchorRef or containerId.
 * Renders as a positioned dropdown (8 placements) on desktop and as a bottom drawer when drawerMediaQuery matches.
 */
export function Dropdown({
  drawerMediaQuery = Media.upToSmall(false),
  placement = 'bottom',
  showBackdrop = false,
  anchorRef,
  containerId,
  ...rest
}: DropdownProps): React.JSX.Element | null {
  if (anchorRef == null && containerId == null) {
    return null
  }
  return (
    <SmartModal
      {...rest}
      anchorRef={anchorRef ?? undefined}
      containerId={containerId ?? undefined}
      drawerMediaQuery={drawerMediaQuery}
      placement={placement}
      showBackdrop={showBackdrop}
    />
  )
}

export type { SmartModalPlacement }
