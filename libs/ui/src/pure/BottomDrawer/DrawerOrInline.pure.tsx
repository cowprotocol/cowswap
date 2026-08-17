import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { BottomDrawer } from './BottomDrawer.pure'

import { Media } from '../../consts'

export interface DrawerOrInlineProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  title?: string
  className?: string
  header?: ReactNode
  footer?: ReactNode
}

export function DrawerOrInline({
  isOpen,
  onOpenChange,
  children,
  title,
  className,
  header,
  footer,
}: DrawerOrInlineProps): ReactNode {
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

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
