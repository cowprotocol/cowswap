import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http, type Chain, type Transport } from 'viem'
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

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

const projectId = WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID

const metadata = {
  name: 'CoW Widget Configurator',
  description: 'Injectable UI of CoWSwap',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon.png'],
}

const SUPPORTED_CHAIN_IDS = Object.values(SupportedChainId).filter((v) => typeof v === 'number') as SupportedChainId[]

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

const networks = Object.values(SUPPORTED_CHAINS) as [Chain, ...Chain[]]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  transports: SUPPORTED_CHAIN_IDS.reduce(
    (acc, chainId) => {
      acc[chainId] = http(RPC_URLS[chainId])
      return acc
    },
    {} as Record<number, Transport>,
  ),
  projectId,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

export function initAppKit(): void {
  createAppKit({
    adapters: [wagmiAdapter],
    allowUnsupportedChain: false,
    defaultNetwork: networks[0],
    enableEIP6963: true,
    features: {
      analytics: false,
      email: false,
      socials: false,
    },
    metadata,
    networks,
    projectId,
  })
}
