import { ReactNode, useCallback } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { Dialog as BaseDialog } from '@base-ui/react/dialog'

import * as styledEl from './Dialog.styled'
import { getOverlayA11yTitle, resolveOverlayHeader } from './resolveOverlayHeader'

const DEFAULT_DIALOG_MAX_WIDTH = 500
const DEFAULT_DIALOG_WIDTH = 'calc(100% - 32px)'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: ReactNode
  onBack?: () => void
  header?: ReactNode
  footer?: ReactNode
  className?: string
  /** CSS `width` of the dialog surface. Defaults to viewport minus side inset. */
  width?: number | string
  /** CSS `max-width` of the dialog surface. Defaults to 500px. */
  maxWidth?: number | string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  onBack,
  header,
  footer,
  className,
  width = DEFAULT_DIALOG_WIDTH,
  maxWidth = DEFAULT_DIALOG_MAX_WIDTH,
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
        <styledEl.Backdrop />
        <styledEl.Viewport>
          <styledEl.Popup className={className} $width={formatSize(width)} $maxWidth={formatSize(maxWidth)}>
            {resolvedHeader ? <styledEl.Header>{resolvedHeader}</styledEl.Header> : null}

            <styledEl.Content>
              <styledEl.VisuallyHiddenTitle>{getOverlayA11yTitle(title, 'Dialog')}</styledEl.VisuallyHiddenTitle>
              {children}
            </styledEl.Content>

            {footer ? <styledEl.Footer>{footer}</styledEl.Footer> : null}
          </styledEl.Popup>
        </styledEl.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

function formatSize(size: number | string): string {
  return typeof size === 'number' ? `${size}px` : size
}
