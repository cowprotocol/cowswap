import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ChainInfo } from '@cowprotocol/types'

import { Field } from 'legacy/state/types'

import { useBridgeSupportedNetworks } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

const SUPPORTED_CHAINS: ChainInfo[] = Object.keys(CHAIN_INFO).map((chainId) => {
  const info = CHAIN_INFO[+chainId as SupportedChainId]

  return {
    id: +chainId,
    name: info.name,
    nativeCurrency: {
      ...info.nativeCurrency,
      name: info.nativeCurrency.name || '',
      symbol: info.nativeCurrency.symbol || '',
    },
    isEvmChain: true,
    blockExplorer: info.explorer,
    logoUrl: info.logo.light,
    mainColor: info.color,
  }
})

export function useChainsToSelect(): ChainInfo[] | undefined {
  const { field } = useSelectTokenWidgetState()
  // TODO: add loading state
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  if (!field) return undefined

  if (field === Field.INPUT) {
    return SUPPORTED_CHAINS
  }

  return bridgeSupportedNetworks
}
