import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { safe, injected } from '@wagmi/connectors'
import { Chain, http } from 'viem'
import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  ink,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
} from 'viem/chains'
import { createConfig, Transport } from 'wagmi'

const SUPPORTED_CHAIN_IDS = Object.values(SupportedChainId).filter((v) => typeof v === 'number')

const SUPPORTED_CHAINS: Record<SupportedChainId, Chain> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.BNB]: bsc,
  [SupportedChainId.GNOSIS_CHAIN]: gnosis,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.LENS]: lens,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.PLASMA]: plasma,
  [SupportedChainId.ARBITRUM_ONE]: arbitrum,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.LINEA]: linea,
  [SupportedChainId.INK]: ink,
  [SupportedChainId.SEPOLIA]: sepolia,
}

export const config = createConfig({
  chains: SUPPORTED_CHAIN_IDS.map((chainId) => SUPPORTED_CHAINS[chainId]) as [Chain, ...Chain[]],
  transports: SUPPORTED_CHAIN_IDS.reduce(
    (acc, chainId) => {
      acc[chainId] = http(RPC_URLS[chainId])
      return acc
    },
    {} as Record<SupportedChainId, Transport>,
  ),
  connectors: [safe(), injected()],
})
