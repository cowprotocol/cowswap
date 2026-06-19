import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl } from '@cowprotocol/common-utils'
import { EvmChains, isEvmChain } from '@cowprotocol/cow-sdk'

import { solana } from '@reown/appkit/networks'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { http } from 'viem'
import { type Transport } from 'wagmi'

import { IS_SOLANA_ENABLED } from './consts'
import { getConnectors } from './getConnectors'

import { bindActiveProvider } from '../bindActiveProvider'
import { interceptEIP6963Providers } from '../providerIsolation'
import { SAFE_CONNECTOR_ID, SUPPORTED_REOWN_NETWORKS } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { wagmiStorage } from '../wagmiStorage'

interceptEIP6963Providers()

const wagmiTransports = SUPPORTED_REOWN_NETWORKS.reduce(
  (acc, chain) => {
    const chainId = chain.id as EvmChains
    const url = RPC_URLS[chainId]
    if (url) {
      acc[chainId] = http(url)
    }
    return acc
  },
  {} as Record<EvmChains, Transport>,
)

/** CAIP-shaped RPCs for AppKit UI / network metadata (pairs with `wagmiTransports`). */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const url = RPC_URLS[chain.id as EvmChains]
  if (url) {
    customRpcUrls[`eip155:${chain.id}`] = [{ url }]
  }
}

const projectId = 'ac287751638b5d374a03c39e37f70376'

const metadata = {
  name: 'CoW Swap | The smartest way to trade cryptocurrencies',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/apple-touch-icon.png'],
}

const wagmiAdapter = new WagmiAdapter({
  batch: {
    multicall: {
      wait: 130, //  coalescing window in ms
      batchSize: 30_000, // calldata size ceiling (30kb)
    },
  },
  // Frequency (in ms) for polling enabled actions & events.
  pollingInterval: 12_000,
  connectors: getConnectors(),
  customRpcUrls,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  storage: wagmiStorage,
  transports: wagmiTransports,
})

const solanaWeb3JsAdapter = new SolanaAdapter()

// Prevent the CoW Widget connector from appearing in the wallet modal.
// It must remain registered with wagmi (for reconnect/connect to work) but should not be
// shown as an option — users connect via the parent dapp's wallet, not by picking a wallet manually.

// const _addWagmiConnector = (wagmiAdapter as any).addWagmiConnector.bind(wagmiAdapter)
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// ;(wagmiAdapter as any).addWagmiConnector = async (connector: { id: string }) => {
//   if (connector.id === COW_WIDGET_CONNECTOR_ID) return
//   return _addWagmiConnector(connector)
// }

const urlChainId = getCurrentChainIdFromUrl()
const defaultEvmChainId: EvmChains = isEvmChain(urlChainId) ? urlChainId : EvmChains.MAINNET

const reownAppKit = createAppKit({
  adapters: IS_SOLANA_ENABLED ? [wagmiAdapter, solanaWeb3JsAdapter] : [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: VIEM_CHAINS[defaultEvmChainId],
  enableEIP6963: true,
  enableReconnect: true,
  enableWalletGuide: false,
  featuredWalletIds: [
    // Coinbase Wallet
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    // imToken — shown prominently so users inside imToken's browser can find the WalletConnect path
    'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef',
  ],
  features: {
    swaps: false,
    onramp: false,
    receive: false,
    send: false,
    analytics: false,
    email: false,
    socials: false,
    connectorTypeOrder: ['recent', 'injected', 'walletConnect'],
  },
  metadata,
  networks: IS_SOLANA_ENABLED ? [...SUPPORTED_REOWN_NETWORKS, solana] : SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})

/**
 * Instantly connect to Safe if in Safe
 */
if (getIsSafeAppIframe()) {
  connectWalletById(SAFE_CONNECTOR_ID, 'safe')
}

bindActiveProvider(wagmiAdapter)

export { wagmiAdapter, reownAppKit, wagmiStorage }
