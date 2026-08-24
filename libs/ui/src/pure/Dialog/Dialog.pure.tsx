import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import * as styledEl from './Dialog.styled'

import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'
import { OverlayLayer } from '../surfaces/OverlayLayer.styled'

export interface DialogProps extends BaseSurfaceProps {
  variant?: DialogVariant
}

export type DialogVariant = 'default' | 'narrow'

function DialogComponent({
  variant = 'default',
  isOpen,
  onOpenChange,
  children,
  a11yTitle,
  className,
}: DialogProps): ReactNode {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  useBodyScrollbarLocker(isOpen)

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BaseDialog.Portal>
        <OverlayLayer data-dialog-layer="">
          <styledEl.Backdrop data-dialog-backdrop="" forceRender />
          <styledEl.Viewport data-dialog-viewport="">
            <styledEl.Popup className={className} $variant={variant}>
              {a11yTitle ? <styledEl.VisuallyHiddenTitle>{a11yTitle}</styledEl.VisuallyHiddenTitle> : null}
              {children}
            </styledEl.Popup>
          </styledEl.Viewport>
        </OverlayLayer>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

export const Dialog = Object.assign(DialogComponent, {
  /** Pass as `ModalHeader` `titleAs` so the visible heading names the dialog. */
  Title: BaseDialog.Title,
})
