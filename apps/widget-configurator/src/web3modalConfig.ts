import { CHAIN_INFO, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'

const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID
const WC_DEFAULT_PROJECT_ID = 'a6cc11517a10f6f12953fd67b1eb67e7'

const projectId = WC_PROJECT_ID || WC_DEFAULT_PROJECT_ID

const metadata = {
  name: 'CoW Widget Configurator',
  description: 'Injectable UI of CoWSwap',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon.png'],
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: false,
  defaultChainId: SupportedChainId.MAINNET,
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function initWeb3Modal() {
  createWeb3Modal({
    ethersConfig,
    chains: Object.keys(CHAIN_INFO).map((_chainId) => {
      const chainId = +_chainId as SupportedChainId
      const info = CHAIN_INFO[chainId]

      return {
        chainId,
        name: info.label,
        rpcUrl: RPC_URLS[chainId],
        explorerUrl: info.explorer,
        currency: info.nativeCurrency.symbol || '',
      }
    }),
    projectId,
    enableAnalytics: false,
  })
}
