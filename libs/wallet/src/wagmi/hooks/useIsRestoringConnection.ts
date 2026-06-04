import { useSyncExternalStore } from 'react'

import { useAccountState } from './useAccountState'

import { useWalletInfo } from '../../api/hooks'
import { getInitialReconnectLifecycle, subscribeInitialReconnect } from '../initialReconnectLifecycle'

function getServerSnapshot(): 'pending' | 'settled' {
  return 'settled'
}

export function useIsRestoringConnection(): boolean {
  const { status } = useAccountState()
  const { account } = useWalletInfo()

  // Web3Provider mounts WagmiProvider with reconnectOnMount={false} and triggers
  // reconnect() from a useEffect, so wagmi's own `status` only flips to 'reconnecting'
  // one render after mount. The `config.setState` guard in config.ts then erases
  // `current` on any subsequent Hydrate.onMount, so we can't rely on the live wagmi
  // state for the initial-load window either.
  //
  // Track the lifecycle explicitly: 'pending' from module init (if sessionStorage held a
  // session) until ReconnectOnMount calls markInitialReconnectSettled() in every code path.
  const lifecycle = useSyncExternalStore(subscribeInitialReconnect, getInitialReconnectLifecycle, getServerSnapshot)

  if (lifecycle === 'pending' && !account) return true
  if (status === 'reconnecting') return true
  if (status === 'connected' && !account) return true

  return false
}
