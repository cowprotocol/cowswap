import { useMemo } from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ChainInfo } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useBridgeSupportedNetworks } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'

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

export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId } = useSelectTokenWidgetState()
  // TODO: add loading state
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()

  return useMemo(() => {
    if (!field) return undefined

    if (field === Field.INPUT) {
      return { defaultChainId: chainId, chains: SUPPORTED_CHAINS }
    }

    return { defaultChainId: selectedTargetChainId, chains: bridgeSupportedNetworks }
  }, [field, selectedTargetChainId, chainId, bridgeSupportedNetworks])
}
