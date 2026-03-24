import { useEffect } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'

import { Media } from '../../consts'
import { SmartModal } from '../SmartModal/SmartModal.pure'

const drawerMediaQuery = Media.upToSmall(false)

export interface BlockOrDrawerProps {
  isOpen: boolean
  onDismiss: () => void
  children: React.ReactNode
}

export function BlockOrDrawer({ isOpen, onDismiss, children }: BlockOrDrawerProps): ReactNode {
  const isDrawerMode = useMediaQuery(drawerMediaQuery)

  useEffect(() => {
    if (!isDrawerMode) {
      onDismiss()
    }
  }, [isDrawerMode, onDismiss])

  if (!isDrawerMode) return children

  return (
    <>
      <SmartModal isOpen={isOpen} onDismiss={onDismiss} drawerMediaQuery={drawerMediaQuery}>
        {children}
      </SmartModal>
    </>
  )
}
