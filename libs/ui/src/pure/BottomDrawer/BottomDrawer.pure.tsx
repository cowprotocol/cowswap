import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Drawer as BaseDrawer } from '@base-ui/react/drawer'

import * as styledEl from './BottomDrawer.styled'

import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'
import { OverlayLayer } from '../surfaces/OverlayLayer.styled'

export type { BaseSurfaceProps as BaseOpenableContainerProps } from '../surfaces/BaseSurface.types'

export type BottomDrawerProps = BaseSurfaceProps

function BottomDrawerComponent({ isOpen, onOpenChange, children, a11yTitle, className }: BottomDrawerProps): ReactNode {
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
                {a11yTitle ? <styledEl.VisuallyHiddenTitle>{a11yTitle}</styledEl.VisuallyHiddenTitle> : null}
                {children}
              </styledEl.Popup>
            </styledEl.Viewport>
          </OverlayLayer>
        </BaseDrawer.Portal>
      </BaseDrawer.VirtualKeyboardProvider>
    </BaseDrawer.Root>
  )
}

export const BottomDrawer = Object.assign(BottomDrawerComponent, {
  /** Pass as `ModalHeader` `titleAs` so the visible heading names the drawer. */
  Title: BaseDrawer.Title,
})
