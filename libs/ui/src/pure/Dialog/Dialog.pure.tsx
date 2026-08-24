import { ReactNode, type UIEvent, useCallback, useEffect, useState } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import clsx from 'clsx'

import * as styledEl from './Dialog.styled'
import { getOverlayA11yTitle, resolveOverlayHeader } from './resolveOverlayHeader'

import { MODAL_ROOT_SCROLLED_CLASS } from '../Modal/Modal.constants'
import { OverlayLayer } from '../Overlay/OverlayLayer.styled'

export interface DialogProps {
  variant?: DialogVariant
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Overlay title used for a11y. When `header` is omitted, also renders a sticky ModalHeader. */
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

  const [isContentScrolled, setIsContentScrolled] = useState(false)

  const handleContentScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setIsContentScrolled(event.currentTarget.scrollTop > 0)
  }, [])

  useEffect(() => {
    if (!open) {
      setIsContentScrolled(false)
    }
  }, [open])

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
            <styledEl.Popup
              className={clsx(className, isContentScrolled && MODAL_ROOT_SCROLLED_CLASS)}
              $variant={variant}
            >
              {resolvedHeader ? <styledEl.Header>{resolvedHeader}</styledEl.Header> : null}

              <styledEl.Content data-dialog-content="" onScroll={handleContentScroll}>
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
