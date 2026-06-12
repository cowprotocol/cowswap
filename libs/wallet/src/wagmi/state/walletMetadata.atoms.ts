import { atom } from 'jotai'

import { walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'

export const isSafeAppAtom = atom((get) => {
  const { connector } = get(walletInfoAtom)
  return connector?.type === ConnectionType.GNOSIS_SAFE
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const { connector } = get(walletInfoAtom)

  // TODO: connector will be undefined on page load until the WalletUpdater kicks in. Consider replacing the updater with atom's onMount/observer.
  if (isSafeApp || connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})
