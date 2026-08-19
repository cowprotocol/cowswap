import { ReactNode, useEffect } from 'react'

import { useLatestRef, useMediaQuery } from '@cowprotocol/common-hooks'

import { Dialog } from './Dialog.pure'

import { Media } from '../../consts'

export interface DialogOrInlineProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Optional a11y title; rendered visually hidden in dialog mode. */
  title?: string
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

export function DialogOrInline({
  isOpen,
  onOpenChange,
  children,
  title,
  className,
  header,
  footer,
}: DialogOrInlineProps): ReactNode {
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const onOpenChangeRef = useLatestRef(onOpenChange)

  useEffect(() => {
    const closeDrawer = onOpenChangeRef.current

    // If we got from "drawer" to "inline" (we make the window wider),
    // we close it, so that if we resize the window back down, the drawer is not already opened:
    if (!isUpToLarge) {
      closeDrawer(false)
    }

    return () => {
      closeDrawer(false)
    }
  }, [onOpenChangeRef, isUpToLarge])

  if (!isUpToLarge) {
    return (
      <>
        {header}
        {children}
        {footer}
      </>
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
    >
      {children}
    </Dialog>
  )
}
