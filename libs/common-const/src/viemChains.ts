import { defineChain } from 'viem'

import { EvmChains, robinhood as robinhoodChainInfo } from '@cowprotocol/cow-sdk'

import {
  arbitrum,
  avalanche,
  base,
  bsc,
  type Chain,
  gnosis,
  ink,
  linea,
  mainnet,
  optimism,
  plasma,
  polygon,
  sepolia,
} from 'viem/chains'

// viem has no definition for Robinhood Chain yet
const robinhood = defineChain({
  id: robinhoodChainInfo.id,
  name: robinhoodChainInfo.label,
  nativeCurrency: {
    name: robinhoodChainInfo.nativeCurrency.name ?? 'Ether',
    symbol: robinhoodChainInfo.nativeCurrency.symbol ?? 'ETH',
    decimals: robinhoodChainInfo.nativeCurrency.decimals,
  },
  rpcUrls: robinhoodChainInfo.rpcUrls,
  blockExplorers: { default: robinhoodChainInfo.blockExplorer },
  contracts: robinhoodChainInfo.contracts,
})

/**
 * viem `Chain` definitions for every EVM chain known to cow-sdk.
 */
export const VIEM_CHAINS: Record<EvmChains, Chain> = {
  [EvmChains.MAINNET]: mainnet,
  [EvmChains.BNB]: bsc,
  [EvmChains.GNOSIS_CHAIN]: gnosis,
  [EvmChains.POLYGON]: polygon,
  [EvmChains.ROBINHOOD]: robinhood,
  [EvmChains.BASE]: base,
  [EvmChains.PLASMA]: plasma,
  [EvmChains.ARBITRUM_ONE]: arbitrum,
  [EvmChains.AVALANCHE]: avalanche,
  [EvmChains.LINEA]: linea,
  [EvmChains.INK]: ink,
  [EvmChains.SEPOLIA]: sepolia,
  [EvmChains.OPTIMISM]: optimism,
}
