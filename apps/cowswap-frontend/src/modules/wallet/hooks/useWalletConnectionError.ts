import { useAtomValue } from 'jotai'

import { walletConnectionAtom } from '../state/walletConnectionAtom'

export function useWalletConnectionError() {
  return useAtomValue(walletConnectionAtom).connectionError
}
