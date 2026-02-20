import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'

import { deprecatedChainsAtom } from 'entities/common/deprecatedChains.atom'

export const isProviderNetworkDeprecatedAtom = atom<boolean>((get) => {
  const { chainId } = get(walletInfoAtom)
  return get(deprecatedChainsAtom).has(chainId)
})
