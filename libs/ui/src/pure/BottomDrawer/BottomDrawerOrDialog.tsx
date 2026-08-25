import { ReactNode, useEffect } from 'react'

import { useLatestRef } from '@cowprotocol/common-hooks'

import { BottomDrawer } from './BottomDrawer.pure'

import { Dialog, type DialogVariant } from '../Dialog/Dialog.pure'
import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'

export interface BottomDrawerOrDialogProps extends BaseSurfaceProps {
  variant?: DialogVariant
  /**
   * When true, render BottomDrawer; otherwise Dialog.
   * Pass the same value used for `ModalHeader` `titleAs`.
   */
  isDrawer: boolean
}

export function BottomDrawerOrDialog({ variant, isDrawer, ...props }: BottomDrawerOrDialogProps): ReactNode {
  const onOpenChangeRef = useLatestRef(props.onOpenChange)

  useEffect(() => {
    const closeOverlay = onOpenChangeRef.current

    // Close when switching overlay type (drawer ↔ dialog) or unmounting,
    // so the other branch does not remount already open.
    return () => {
      closeOverlay(false)
    }
  }, [onOpenChangeRef, isDrawer])

  if (isDrawer) {
    return <BottomDrawer {...props} />
  }

  return <Dialog {...props} variant={variant} />
}
