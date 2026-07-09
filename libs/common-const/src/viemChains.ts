import { EvmChains } from '@cowprotocol/cow-sdk'

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

/**
 * viem `Chain` definitions for every EVM chain known to cow-sdk.
 */
export const VIEM_CHAINS: Record<EvmChains, Chain> = {
  [EvmChains.MAINNET]: mainnet,
  [EvmChains.BNB]: bsc,
  [EvmChains.GNOSIS_CHAIN]: gnosis,
  [EvmChains.POLYGON]: polygon,
  [EvmChains.BASE]: base,
  [EvmChains.PLASMA]: plasma,
  [EvmChains.ARBITRUM_ONE]: arbitrum,
  [EvmChains.AVALANCHE]: avalanche,
  [EvmChains.LINEA]: linea,
  [EvmChains.INK]: ink,
  [EvmChains.SEPOLIA]: sepolia,
  [EvmChains.OPTIMISM]: optimism,
}
