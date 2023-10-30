import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { gnosis, goerli, mainnet } from 'wagmi/chains'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

const projectId = WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID

const metadata = {
  name: 'CoW Widget Configurator',
  description: 'Injectable UI of CoWSwap',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon.png'],
}

const chains = [mainnet, gnosis, goerli]

export const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

export const web3Modal = createWeb3Modal({ wagmiConfig, projectId, chains })
