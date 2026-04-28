import { atom } from 'jotai'

import { walletInfoAtom } from '../../api/state'
import { ConnectionType } from '../../api/types'

export const isSafeAppAtom = atom((get) => {
  const { connector } = get(walletInfoAtom)

  return connector?.connectionType === ConnectionType.GNOSIS_SAFE
})

export const isSafeViaWcAtom = atom((get) => {
  const isSafeApp = get(isSafeAppAtom)
  const { connector } = get(walletInfoAtom)
  // TODO: Finish this in an atom-compatible way:
  // const wcPeerMetadata = useWcPeerMetadata(connector)

  if (isSafeApp) return false
  if (connector?.type !== ConnectionType.WALLET_CONNECT_V2) return false

  // const peerName = wcPeerMetadata.walletName?.toLowerCase() || ''

  // return peerName.includes('safe')

  return false
})
