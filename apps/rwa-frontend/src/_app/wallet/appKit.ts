import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { DEFAULT_NETWORK, SUPPORTED_NETWORKS } from './networks'

import { WALLET_CONNECT_PROJECT_ID } from '@/shared/config'

export const wagmiAdapter = new WagmiAdapter({
  networks: SUPPORTED_NETWORKS,
  projectId: WALLET_CONNECT_PROJECT_ID,
  // Defers reconnecting from localStorage until after hydration, the static HTML is always rendered disconnected
  ssr: true,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  networks: SUPPORTED_NETWORKS,
  defaultNetwork: DEFAULT_NETWORK,
  projectId: WALLET_CONNECT_PROJECT_ID,
  metadata: {
    name: 'CoW RWA',
    description: 'Trade tokenized stocks with CoW Protocol',
    url: 'https://swap.cow.fi',
    icons: ['https://swap.cow.fi/favicon.png'],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
})
