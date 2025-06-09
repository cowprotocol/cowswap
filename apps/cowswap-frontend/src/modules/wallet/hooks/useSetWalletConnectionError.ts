import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { walletConnectionAtom } from '../state/walletConnectionAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
