import { atom } from 'jotai'

import { isChainDeprecated } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

export const isProviderNetworkDeprecatedAtom = atom<boolean>((get) => {
  const { chainId } = get(walletInfoAtom)

  return isChainDeprecated(chainId)
})
