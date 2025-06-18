import { useAtomValue } from 'jotai'

import { walletConnectionAtom } from '../state/walletConnectionAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useWalletConnectionError() {
  return useAtomValue(walletConnectionAtom).connectionError
}
