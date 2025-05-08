import { useMemo } from 'react'

import { BaseChainInfo, CHAIN_INFO, RPC_URLS } from '@cowprotocol/common-const'
import { useIsBridgingEnabled } from '@cowprotocol/common-hooks'
import { SupportedChainId, ChainInfo } from '@cowprotocol/cow-sdk'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { Field } from 'legacy/state/types'

import { useBridgeSupportedNetworks } from 'modules/bridge'

import { useSelectTokenWidgetState } from './useSelectTokenWidgetState'

import { ChainsToSelectState } from '../types'

export function mapChainInfo(chainId: SupportedChainId, info: BaseChainInfo): ChainInfo {
  return {
    addressPrefix: info.addressPrefix,
    contracts: {},
    docs: {
      url: info.docs,
      name: `${info.label} Docs`,
    },
    isTestnet: chainId === SupportedChainId.SEPOLIA,
    rpcUrls: {
      default: {
        http: [RPC_URLS[chainId]],
      },
    },
    website: {
      url: info.infoLink,
      name: info.label,
    },
    id: chainId,
    label: info.label,
    nativeCurrency: {
      ...info.nativeCurrency,
      name: info.nativeCurrency.name || '',
      symbol: info.nativeCurrency.symbol || '',
    },
    blockExplorer: {
      url: info.explorer,
      name: info.explorerTitle,
    },
    logo: {
      light: info.logo.light,
      dark: info.logo.dark,
    },
    color: info.color,
  }
}

const SUPPORTED_CHAINS: ChainInfo[] = Object.keys(CHAIN_INFO).map((chainId) => {
  const supportedChainId = +chainId as SupportedChainId
  const info = CHAIN_INFO[supportedChainId]

  return mapChainInfo(supportedChainId, info)
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
  const isSmartContractWallet = useIsSmartContractWallet()
  const isBridgingEnabled = useIsBridgingEnabled(isSmartContractWallet)

  return useMemo(() => {
    if (!field || !isBridgingEnabled) return undefined

    const currentChainInfo = mapChainInfo(chainId, CHAIN_INFO[chainId])
    const isCurrentChainInBridge = bridgeSupportedNetworks?.find((bridgeChain) => bridgeChain.id === chainId)
    const chains =
      field === Field.INPUT
        ? SUPPORTED_CHAINS
        : [...(isCurrentChainInBridge ? [] : [currentChainInfo]), ...(bridgeSupportedNetworks || [])]

    return {
      defaultChainId: selectedTargetChainId,
      chains,
      isLoading,
    }
  }, [field, selectedTargetChainId, chainId, bridgeSupportedNetworks, isLoading, isBridgingEnabled])
}
