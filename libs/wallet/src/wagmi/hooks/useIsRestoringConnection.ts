import { useAppKitState } from '@reown/appkit/react'
import { useConnection } from 'wagmi'

import { useWalletInfo } from '../../api/hooks'

export function useIsRestoringConnection(): boolean {
  const { status } = useConnection()
  const { account } = useWalletInfo()
  const state = useAppKitState()
  const { loading, initialized } = state

  if (loading || !initialized) return true
  if (status === 'reconnecting') return true

  return status === 'connected' && !account
}
