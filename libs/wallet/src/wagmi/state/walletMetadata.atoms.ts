import { atom } from 'jotai'

import { walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'

export const isSafeAppAtom = atom((get) => {
  const { connector } = get(walletInfoAtom)

  return connector?.connectionType === ConnectionType.GNOSIS_SAFE
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const { connector } = get(walletInfoAtom)

  if (isSafeApp || connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  const { walletName } = get(walletDetailsAtom)
  const peerName = walletName?.toLowerCase() || ''

  return peerName.includes('safe')
})
