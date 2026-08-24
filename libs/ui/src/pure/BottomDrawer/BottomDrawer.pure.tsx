import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Drawer as BaseDrawer } from '@base-ui/react/drawer'

import * as styledEl from './BottomDrawer.styled'

import { OverlayLayer } from '../Overlay/OverlayLayer.styled'

export interface BottomDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Optional a11y title; rendered visually hidden */
  title?: string
  className?: string
}

export function BottomDrawer({ isOpen, onOpenChange, children, title, className }: BottomDrawerProps): ReactNode {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  useBodyScrollbarLocker(isOpen)

  return (
    <BaseDrawer.Root open={isOpen} onOpenChange={handleOpenChange} swipeDirection="down">
      <BaseDrawer.VirtualKeyboardProvider>
        <BaseDrawer.Portal>
          <OverlayLayer data-bottom-drawer-layer="">
            <styledEl.Backdrop data-bottom-drawer-backdrop="" forceRender />
            <styledEl.Viewport data-bottom-drawer-viewport="">
              <styledEl.Popup className={className}>
                <styledEl.Handle aria-hidden />
                <styledEl.VisuallyHiddenTitle>{title ?? 'Drawer'}</styledEl.VisuallyHiddenTitle>
                {children}
              </styledEl.Popup>
            </styledEl.Viewport>
          </OverlayLayer>
        </BaseDrawer.Portal>
      </BaseDrawer.VirtualKeyboardProvider>
    </BaseDrawer.Root>
  )
}
