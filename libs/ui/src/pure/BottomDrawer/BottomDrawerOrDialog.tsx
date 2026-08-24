import { ReactNode, useEffect } from 'react'

import { useLatestRef, useMediaQuery } from '@cowprotocol/common-hooks'

import { BottomDrawer } from './BottomDrawer.pure'

import { Media } from '../../consts'
import { Dialog, type DialogVariant } from '../Dialog/Dialog.pure'

export interface BottomDrawerOrDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Optional a11y title; rendered visually hidden. */
  title?: string
  className?: string
  header?: ReactNode
  footer?: ReactNode
  variant?: DialogVariant
}

export function BottomDrawerOrDialog({
  isOpen,
  onOpenChange,
  children,
  title,
  className,
  header,
  footer,
  variant,
}: BottomDrawerOrDialogProps): ReactNode {
  const isUpToSmall = useMediaQuery(Media.upToSmall(false))

  const onOpenChangeRef = useLatestRef(onOpenChange)

  useEffect(() => {
    const closeOverlay = onOpenChangeRef.current

    // Close when switching overlay type (drawer ↔ dialog) or unmounting,
    // so the other branch does not remount already open.
    return () => {
      closeOverlay(false)
    }
  }, [onOpenChangeRef, isUpToSmall])

  if (isUpToSmall) {
    return (
      <BottomDrawer
        open={isOpen}
        onOpenChange={onOpenChange}
        title={title}
        className={className}
        header={header}
        footer={footer}
      >
        {children}
      </BottomDrawer>
    )
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      className={className}
      header={header}
      footer={footer}
      variant={variant}
    >
      {children}
    </Dialog>
  )
}
