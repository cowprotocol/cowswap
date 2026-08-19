import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import * as styledEl from './Dialog.styled'
import { getOverlayA11yTitle, resolveOverlayHeader } from './resolveOverlayHeader'

import { OverlayLayer } from '../Overlay/OverlayLayer.styled'

export interface DialogProps {
  variant?: DialogVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Optional a11y title; rendered visually hidden. Use `header` for visible chrome. */
  title?: ReactNode
  onBack?: () => void
  header?: ReactNode
  footer?: ReactNode
  className?: string
}

export type DialogVariant = 'default' | 'narrow'

export function Dialog({
  variant = 'default',
  open,
  onOpenChange,
  children,
  title,
  onBack,
  header,
  footer,
  className,
}: DialogProps): ReactNode {
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen)
    },
    [onOpenChange],
  )

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const resolvedHeader = resolveOverlayHeader({
    header,
    title,
    onBack,
    onClose: handleClose,
  })

  useBodyScrollbarLocker(open)

  return (
    <BaseDialog.Root open={open} onOpenChange={handleOpenChange}>
      <BaseDialog.Portal>
        <OverlayLayer data-dialog-layer="">
          <styledEl.Backdrop data-dialog-backdrop="" forceRender />
          <styledEl.Viewport data-dialog-viewport="">
            <styledEl.Popup className={className} $variant={variant}>
              {resolvedHeader ? <styledEl.Header>{resolvedHeader}</styledEl.Header> : null}

              <styledEl.Content>
                <styledEl.VisuallyHiddenTitle>{getOverlayA11yTitle(title, 'Dialog')}</styledEl.VisuallyHiddenTitle>
                {children}
              </styledEl.Content>

              {footer ? <styledEl.Footer>{footer}</styledEl.Footer> : null}
            </styledEl.Popup>
          </styledEl.Viewport>
        </OverlayLayer>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
