import { LAUNCH_DARKLY_VIEM_MIGRATION, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { Chain, http } from 'viem'
import { arbitrum, avalanche, base, bsc, gnosis, lens, linea, mainnet, plasma, polygon, sepolia } from 'viem/chains'
import { Transport } from 'wagmi'

// TODO change
const projectId = 'be9f19dedc14dc05c554d97f92aed71d'

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
  [SupportedChainId.SEPOLIA]: sepolia,
}

const metadata = {
  name: 'CoW Swap',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon-light-mode.png'],
}

const networks = SUPPORTED_CHAIN_IDS.map((chainId) => SUPPORTED_CHAINS[chainId]) as [Chain, ...Chain[]]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  transports: SUPPORTED_CHAIN_IDS.reduce(
    (acc, chainId) => {
      acc[chainId] = http(RPC_URLS[chainId])
      return acc
    },
    {} as Record<SupportedChainId, Transport>,
  ),
  projectId,
})

createAppKit({
  adapters: [wagmiAdapter],
  // TODO M-7 COW-572
  // this will become false once the feature flag is removed
  allowUnsupportedChain: !LAUNCH_DARKLY_VIEM_MIGRATION,
  defaultNetwork: networks[0],
  enableEIP6963: true,
  enableWalletGuide: false,
  featuredWalletIds: ['fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'],
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  metadata,
  networks,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})
