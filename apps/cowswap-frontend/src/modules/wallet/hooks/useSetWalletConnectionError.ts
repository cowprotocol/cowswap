import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { walletConnectionAtom } from '../state/walletConnectionAtom'

export function useSetWalletConnectionError() {
  const setWalletConnectionState = useSetAtom(walletConnectionAtom)

  return useCallback(
    (error: string | undefined) => {
      setWalletConnectionState((state) => ({
        ...state,
        connectionError: error,
      }))
    },
    [setWalletConnectionState]
  )
}
