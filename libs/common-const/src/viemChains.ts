import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { defineChain } from 'viem'
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
  plasma,
  polygon,
  sepolia,
} from 'viem/chains'

const mainnetFork: Chain = defineChain({ ...mainnet, id: SupportedChainId.MAINNET })

export const VIEM_CHAINS: Record<SupportedChainId, Chain> = {
  [SupportedChainId.MAINNET]: mainnetFork,
  [SupportedChainId.BNB]: bsc,
  [SupportedChainId.GNOSIS_CHAIN]: gnosis,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.PLASMA]: plasma,
  [SupportedChainId.ARBITRUM_ONE]: arbitrum,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.LINEA]: linea,
  [SupportedChainId.INK]: ink,
  [SupportedChainId.SEPOLIA]: sepolia,
}
