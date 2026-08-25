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
    const closeDrawer = onOpenChangeRef.current

    // If we got from "drawer" to "inline" (we make the window wider),
    // we close it, so that if we resize the window back down, the drawer is not already opened:
    if (!isDialog) {
      closeDrawer(false)
    }

    return () => {
      closeDrawer(false)
    }
  }, [onOpenChangeRef, isDialog])

  if (!isDialog) {
    return children
  }

  return <Dialog {...props}>{children}</Dialog>
}
