import { IS_SOLANA_ENABLED, RPC_URLS } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { OptionsController } from '@reown/appkit-controllers'
import { http } from 'viem'
import { type Transport } from 'wagmi'

import { getConnectors } from './getConnectors'
import { getReownDefaultNetwork } from './getReownDefaultNetwork'

import { bindActiveProvider } from '../bindActiveProvider'
import { interceptEIP6963Providers } from '../providerIsolation'
import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { SUPPORTED_REOWN_NETWORKS } from '../reown/networks'
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

const solanaAdapter = new SolanaAdapter()

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

// AppKit 1.8.19 does not copy createAppKit({ enableInjected }) into OptionsController.state.
// WagmiAdapter.addWagmiConnectors() reads this controller state before adding its default injected connector.
OptionsController.setOptions({ ...OptionsController.state, enableInjected: false })

const isSafeApp = getIsSafeAppIframe()
const isWidget = isInjectedWidget()
const hasRecentConnector =
  typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(`${wagmiStorage.key}.recentConnectorId`))

const reownAppKit = createAppKit({
  adapters: IS_SOLANA_ENABLED ? [wagmiAdapter, solanaAdapter] : [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: getReownDefaultNetwork(),
  enableEIP6963: true,
  enableInjected: false,
  // Safe iframe and widget mode rely on implicit auto-connect from the external runtime
  // (Safe App SDK / WidgetEthereumProvider iframe transport). Reown needs a wired
  // reconnect path at init for either connector to be picked up; without it the widget
  // stays on "Connect wallet" even though the parent has an active wallet — see #7777.
  // For regular desktop we keep the cross-app isolation guard: only reconnect if the user
  // has previously connected in this storage namespace.
  enableReconnect: isSafeApp || isWidget || hasRecentConnector,
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
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})

/**
 * Instantly connect based on the runtime context:
 * - Safe iframe → Safe App SDK connector
 * - Widget iframe → parent-forwarding provider (COW_WIDGET_CONNECTOR_ID)
 * - Mobile injected browser (MetaMask/Coinbase Wallet/etc.) → injected connector
 *   (only if the user has a stored recent connector — avoids first-visit auto-connect)
 */
if (isSafeApp) {
  connectWalletById(SAFE_CONNECTOR_ID, 'safe')
} else if (isWidget) {
  connectWalletById(COW_WIDGET_CONNECTOR_ID, 'cow-widget')
} else if (hasRecentConnector && isMobile && window.ethereum) {
  connectWalletById('injected', 'injected')
}

bindActiveProvider(wagmiAdapter)

export { wagmiAdapter, reownAppKit, wagmiStorage }
