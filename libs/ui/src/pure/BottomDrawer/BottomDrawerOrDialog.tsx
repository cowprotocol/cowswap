import { ReactNode, useEffect } from 'react'

import { useLatestRef, useMediaQuery } from '@cowprotocol/common-hooks'

import { BottomDrawer } from './BottomDrawer.pure'

import { Media } from '../../consts'
import { Dialog, type DialogVariant } from '../Dialog/Dialog.pure'
import { type BaseSurfaceProps } from '../surfaces/BaseSurface.types'

export interface BottomDrawerOrDialogProps extends BaseSurfaceProps {
  variant?: DialogVariant
}

export function BottomDrawerOrDialog({ variant, ...props }: BottomDrawerOrDialogProps): ReactNode {
  const isUpToSmall = useMediaQuery(Media.upToSmall(false))

  const onOpenChangeRef = useLatestRef(props.onOpenChange)

  useEffect(() => {
    const closeOverlay = onOpenChangeRef.current

    // Close when switching overlay type (drawer ↔ dialog) or unmounting,
    // so the other branch does not remount already open.
    return () => {
      closeOverlay(false)
    }
  }, [onOpenChangeRef, isUpToSmall])

  if (isUpToSmall) {
    return <BottomDrawer {...props} />
  }

  return <Dialog {...props} variant={variant} />
}
