import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

import { DEFAULT_NETWORK, SUPPORTED_NETWORKS } from './networks'

// Same registered Reown Cloud project as cowswap-frontend: the public default one lacks wallet deeplinks
const DEFAULT_PROJECT_ID = 'ac287751638b5d374a03c39e37f70376'
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || DEFAULT_PROJECT_ID

export const wagmiAdapter = new WagmiAdapter({
  networks: SUPPORTED_NETWORKS,
  projectId,
  // Defers reconnecting from localStorage until after hydration, the static HTML is always rendered disconnected
  ssr: true,
})

export const wagmiConfig = wagmiAdapter.wagmiConfig

createAppKit({
  adapters: [wagmiAdapter],
  networks: SUPPORTED_NETWORKS,
  defaultNetwork: DEFAULT_NETWORK,
  projectId,
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
