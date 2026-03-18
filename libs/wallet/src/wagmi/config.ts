import { RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { safe } from '@wagmi/connectors'
import { createStorage } from 'wagmi'

import { throttledInjected } from './connectors/throttledInjected'

import { SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

/** Custom RPC URLs so read calls use our RPCs instead of WalletConnect relay (avoids CORS/403 on localhost). */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const url = RPC_URLS[chain.id as SupportedChainId]
  if (url) {
    customRpcUrls[`eip155:${chain.id}`] = [{ url }]
  }
}

const projectId = 'be9f19dedc14dc05c554d97f92aed71d'

const WAGMI_STORAGE_KEY = 'cowswap-wallet'

export const REOWN_USE_NOOP_STORAGE = false
const storage =
  typeof window !== 'undefined'
    ? createStorage({
        storage: window.localStorage,
        key: WAGMI_STORAGE_KEY,
      })
    : createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })

const metadata = {
  name: 'CoW Swap',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon-light-mode.png'],
}

export const wagmiAdapter = new WagmiAdapter({
  connectors: [safe(), throttledInjected()],
  customRpcUrls,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  storage,
})

export const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  allowUnsupportedChain: false,
  customRpcUrls,
  defaultNetwork: SUPPORTED_REOWN_NETWORKS[0],
  enableEIP6963: true,
  enableReconnect: true,
  enableWalletGuide: false,
  featuredWalletIds: ['fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'],
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  metadata,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})
