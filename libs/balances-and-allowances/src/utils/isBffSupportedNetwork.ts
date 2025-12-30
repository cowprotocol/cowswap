import { useAtomValue } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { bffUnsupportedChainsAtom } from '../state/isBffFailedAtom'

// TODO: check before Plasma launch. Currently unsupported on 2025/10/20
const UNSUPPORTED_BFF_NETWORKS = [SupportedChainId.PLASMA, SupportedChainId.SEPOLIA]

export function isBffSupportedNetwork(chainId: SupportedChainId): boolean {
  return !UNSUPPORTED_BFF_NETWORKS.includes(chainId)
}

export function useIsBffSupportedNetwork(chainId: SupportedChainId): boolean {
  const unsupportedChains = useAtomValue(bffUnsupportedChainsAtom)
  return isBffSupportedNetwork(chainId) && !unsupportedChains.has(chainId)
}
