import { ReactNode, useEffect } from 'react'

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

  useEffect(() => {
    const onOpenChange = onOpenChangeRef.current

    if (!isDialog) {
      // Inline callers render children regardless of `isOpen`. Close so a later
      // resize into the dialog branch does not reopen a drawer the user never opened.
      onOpenChange(false)
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
