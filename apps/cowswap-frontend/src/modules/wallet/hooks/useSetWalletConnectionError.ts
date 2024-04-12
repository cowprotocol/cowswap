import { useSetAtom } from 'jotai'

import { walletConnectionAtom } from '../state/walletConnectionAtom'

export function useSetWalletConnectionError() {
  const setWalletConnectionState = useSetAtom(walletConnectionAtom)

  return (error: string | undefined) => {
    setWalletConnectionState((state) => ({
      ...state,
      connectionError: error,
    }))
  }
}
