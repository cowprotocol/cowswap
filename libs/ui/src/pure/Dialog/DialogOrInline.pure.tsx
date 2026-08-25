import { ReactNode, useEffect, useRef } from 'react'

import { useLatestRef } from '@cowprotocol/common-hooks'

import { Dialog } from './Dialog.pure'

import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'

export interface DialogOrInlineProps extends BaseSurfaceProps {
  /**
   * When true, wrap children in Dialog; otherwise render inline.
   * Pass the same value used to gate `ModalHeader` / `Dialog.Title`.
   */
  isDialog: boolean
}

export function DialogOrInline({ children, isDialog, ...props }: DialogOrInlineProps): ReactNode {
  const onOpenChangeRef = useLatestRef(props.onOpenChange)
  const wasDialogRef = useRef(isDialog)

  useEffect(() => {
    const onOpenChange = onOpenChangeRef.current
    const wasDialog = wasDialogRef.current
    wasDialogRef.current = isDialog

    if (!isDialog) {
      // Inline mode: keep the drawer closed so resizing back down does not reopen it.
      onOpenChange(false)
    } else if (!wasDialog) {
      // Switched from inline → dialog (e.g. desktop → mobile while viewing the table).
      // Open so content stays visible inside the dialog instead of vanishing into a closed portal.
      onOpenChange(true)
    }

    return () => {
      onOpenChange(false)
    }
  }, [onOpenChangeRef, isDialog])

  if (!isDialog) {
    return children
  }

  return <Dialog {...props}>{children}</Dialog>
}
