import { useMemo } from 'react'

import { BaseChainInfo, CHAIN_INFO } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ChainInfo } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useBridgeSupportedNetworks } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'

function mapChainInfo(chainId: number, info: BaseChainInfo): ChainInfo {
  return {
    id: chainId,
    name: info.label,
    nativeCurrency: {
      ...info.nativeCurrency,
      name: info.nativeCurrency.name || '',
      symbol: info.nativeCurrency.symbol || '',
    },
    isEvmChain: true,
    blockExplorer: info.explorer,
    logoUrl: {
      light: info.logo.light,
      dark: info.logo.dark,
    },
    mainColor: info.color,
  }
}

const SUPPORTED_CHAINS: ChainInfo[] = Object.keys(CHAIN_INFO).map((chainId) => {
  const info = CHAIN_INFO[+chainId as SupportedChainId]

  return mapChainInfo(+chainId, info)
})

/**
 * Returns an array of chains to select in the token selector widget.
 * The array depends on sell/buy token selection.
 * For the sell token we return all supported chains.
 * For the buy token we return current network + all bridge target networks.
 */
export function useChainsToSelect(): ChainsToSelectState | undefined {
  const { chainId } = useWalletInfo()
  const { field, selectedTargetChainId = chainId } = useSelectTokenWidgetState()
  const { data: bridgeSupportedNetworks, isLoading } = useBridgeSupportedNetworks()
  const isBridgingEnabled = useIsBridgingEnabled()

  return useMemo(() => {
    if (!field || !isBridgingEnabled) return undefined

    const currentChainInfo = mapChainInfo(chainId, CHAIN_INFO[chainId])
    const chains = field === Field.INPUT ? SUPPORTED_CHAINS : [currentChainInfo, ...(bridgeSupportedNetworks || [])]

    return {
      defaultChainId: selectedTargetChainId,
      chains,
      isLoading,
    }
  }, [field, selectedTargetChainId, chainId, bridgeSupportedNetworks, isLoading, isBridgingEnabled])
}
