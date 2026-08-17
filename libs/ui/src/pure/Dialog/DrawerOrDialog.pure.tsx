import { ReactNode, useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { Dialog } from './Dialog.pure'
import { getOverlayA11yTitle, resolveOverlayHeader } from './resolveOverlayHeader'

import { Media } from '../../consts'
import { BottomDrawer } from '../BottomDrawer/BottomDrawer.pure'

export interface DrawerOrDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: ReactNode
  onBack?: () => void
  header?: ReactNode
  footer?: ReactNode
  className?: string
  maxWidth?: number | string
}

export function DrawerOrDialog({
  isOpen,
  onOpenChange,
  children,
  title,
  onBack,
  header,
  footer,
  className,
  maxWidth,
}: DrawerOrDialogProps): ReactNode {
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  if (isUpToLarge) {
    const resolvedHeader = resolveOverlayHeader({
      header,
      title,
      onBack,
      onClose: handleClose,
    })

    return (
      <BottomDrawer
        open={isOpen}
        onOpenChange={onOpenChange}
        title={getOverlayA11yTitle(title, 'Drawer')}
        className={className}
        header={resolvedHeader}
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
      onBack={onBack}
      className={className}
      header={header}
      footer={footer}
      maxWidth={maxWidth}
    >
      {children}
    </Dialog>
  )
}
