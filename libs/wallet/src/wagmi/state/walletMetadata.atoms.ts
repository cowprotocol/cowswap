import { atom } from 'jotai'

import { walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'

export const isSafeAppAtom = atom((get) => {
  const { connector } = get(walletInfoAtom)

  console.log('connector?.type =', connector?.type)
  console.log('connector?.connectionType =', connector?.connectionType)

  // Wagmi connectors expose `type`; keep a fallback for older connector payloads
  // that may still provide `connectionType`.
  return connector?.type === ConnectionType.GNOSIS_SAFE || connector?.connectionType === ConnectionType.GNOSIS_SAFE
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const { connector } = get(walletInfoAtom)

  if (isSafeApp || connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})
