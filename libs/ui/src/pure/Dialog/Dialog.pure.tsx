import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import * as styledEl from './Dialog.styled'

import { OverlayLayer } from '../Overlay/OverlayLayer.styled'

export interface DialogProps {
  variant?: DialogVariant
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Overlay title used for a11y. */
  title?: ReactNode
  className?: string
}

export type DialogVariant = 'default' | 'narrow'

export function Dialog({
  variant = 'default',
  isOpen,
  onOpenChange,
  children,
  title,
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
              <styledEl.VisuallyHiddenTitle>
                {typeof title === 'string' ? title : 'Dialog'}
              </styledEl.VisuallyHiddenTitle>
              {children}
            </styledEl.Popup>
          </styledEl.Viewport>
        </OverlayLayer>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
