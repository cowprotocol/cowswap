import { useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { useSetOrdersTableDrawerOpen } from 'modules/trade'

export function useEoaTwapSuccessDismiss(onDismiss: () => void): () => void {
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))

  return useCallback(() => {
    onDismiss()

    if (isUpToLarge) {
      setOrdersTableDrawerOpen(true)
    }
  }, [isUpToLarge, onDismiss, setOrdersTableDrawerOpen])
}
