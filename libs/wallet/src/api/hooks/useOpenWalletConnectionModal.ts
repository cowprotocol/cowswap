import { useCallback } from 'react'

import { useAppKit } from '@reown/appkit/react'

import { pruneStaleConnections } from '../../reown/pruneStaleConnections'

export function useOpenWalletConnectionModal(): () => void {
  const { open } = useAppKit()

  return useCallback(() => {
    pruneStaleConnections()
    open()
  }, [open])
}
