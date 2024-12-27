import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'

import { SUPPORTED_REOWN_NETWORKS } from './consts'

// TODO: change
const projectId = 'be9f19dedc14dc05c554d97f92aed71d'

const metadata = {
  name: 'CoW Swap',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon-light-mode.png'],
}

export const reownAppKit = createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata: metadata,
  networks: SUPPORTED_REOWN_NETWORKS,
  defaultNetwork: SUPPORTED_REOWN_NETWORKS[0],
  projectId,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  enableEIP6963: true,
  enableWalletGuide: false,
  allowUnsupportedChain: false,
  featuredWalletIds: ['fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa'],
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})
