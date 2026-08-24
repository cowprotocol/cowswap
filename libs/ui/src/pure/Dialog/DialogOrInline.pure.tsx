import { ReactNode, useEffect } from 'react'

import { useLatestRef, useMediaQuery } from '@cowprotocol/common-hooks'

import { Dialog } from './Dialog.pure'

import { Media } from '../../consts'

export interface DialogOrInlineProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  /** Overlay title used for a11y. */
  title?: string
  className?: string
}

export function DialogOrInline({ children, ...props }: DialogOrInlineProps): ReactNode {
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const onOpenChangeRef = useLatestRef(props.onOpenChange)

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
    return children
  }

  return <Dialog {...props}>{children}</Dialog>
}
