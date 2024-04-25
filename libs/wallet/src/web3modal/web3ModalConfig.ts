import { CHAIN_INFO, RPC_URLS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react'
import { addSafeAppConnector } from './connectors/safeAppConnector'
import { addTrezorConnector } from './connectors/trezor/trezorConnector'

const projectId = '7bd490257c3457cc6a5ebcc02066c21a'

const metadata = {
  name: 'CoW Swap',
  description: 'CoW Swap | The smartest way to trade cryptocurrencies',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/favicon.png'],
}

const ethersConfig = defaultConfig({
  metadata,

  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: SupportedChainId.MAINNET, // used for the Coinbase SDK
})

export function initWeb3Modal() {
  const modal = createWeb3Modal({
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

  addSafeAppConnector()
  addTrezorConnector()

  return modal
}
