import { atom } from 'jotai'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { deprecatedChainsAtom } from 'entities/common/deprecatedChains.atom'

import { AFFILIATE_SUPPORTED_CHAIN_IDS } from '../config/affiliateProgram.const'

export const affiliateSupportedChainIdsAtom = atom<readonly SupportedChainId[]>((get) => {
  const deprecatedChains = get(deprecatedChainsAtom)

  return AFFILIATE_SUPPORTED_CHAIN_IDS.filter((chainId) => !deprecatedChains.has(chainId))
})

export const affiliateSupportedNetworkNamesAtom = atom<string[]>((get) =>
  get(affiliateSupportedChainIdsAtom).map((chainId) => CHAIN_INFO[chainId].label),
)
