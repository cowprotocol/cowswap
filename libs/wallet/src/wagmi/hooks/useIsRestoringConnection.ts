import { useConnection } from 'wagmi'

import { useWalletInfo } from '../../api/hooks'

export function useIsRestoringConnection(): boolean {
  const { status } = useConnection()
  const { account } = useWalletInfo()

  // WalletInfo is backed by an atom updated from wagmi, so account can lag behind
  // the connected status for one render. Keep showing reconnecting during that gap.
  return status === 'reconnecting' || (status === 'connected' && !account)
}
