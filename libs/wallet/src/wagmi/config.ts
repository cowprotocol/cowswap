import { http } from 'viem'
import { type Transport } from 'wagmi'

import { IS_SOLANA_ENABLED, RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { isInjectedWidget, isMobile } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { OptionsController } from '@reown/appkit-controllers'

import { getConnectors } from './getConnectors'
import { getReownDefaultNetwork } from './getReownDefaultNetwork'

import { bindActiveProvider } from '../bindActiveProvider'
import { interceptEIP6963Providers } from '../providerIsolation'
import { SAFE_CONNECTOR_ID } from '../reown/consts'
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
      acc[chainId] = http(url, { batch: { batchSize: 50, wait: 300 } })
    }
    return acc
  },
  {} as Record<EvmChains, Transport>,
)

const walletRpcUrlOverrides: Partial<Record<EvmChains, string>> = {
  // Viem's Thirdweb defaults rate-limit wallet chain-ID checks.
  [EvmChains.BNB]: 'https://bsc-rpc.publicnode.com',
  [EvmChains.SEPOLIA]: 'https://ethereum-sepolia-rpc.publicnode.com',
}

/** Public RPCs for AppKit's UI and wallet network-add prompts. */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const chainId = chain.id as EvmChains
  const url = walletRpcUrlOverrides[chainId] ?? VIEM_CHAINS[chainId]?.rpcUrls.default.http[0]
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
  batch: window.__COWSWAP_E2E__
    ? undefined
    : {
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
  typeof localStorage !== 'undefined' &&
  Boolean(
    localStorage.getItem('@appkit/eip155:connected_connector_id') ||
      localStorage.getItem('@appkit/solana:connected_connector_id'),
  )

const reownAppKit = createAppKit({
  adapters: IS_SOLANA_ENABLED ? [wagmiAdapter, solanaAdapter] : [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: getReownDefaultNetwork(),
  // Widget mode delegates wallet ownership to its host via WidgetEthereumProvider (iframe
  // transport). Enabling EIP-6963 in a widget context lets Reown discover and connect to
  // window.ethereum directly, bypassing the transport and leaking browser-wallet state into
  // embedded contexts.
  enableEIP6963: !isWidget,
  enableInjected: false,
  enableReconnect: isSafeApp || isMobile || isWidget || hasRecentConnector,
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
 * Reconnect to the injected wallet, waiting for it to become available first.
 *
 * Mobile in-app browsers (e.g. MetaMask on iOS) may attach `window.ethereum` a
 * few hundred ms after the app bootstraps, so the synchronous check below can run
 * before the provider exists and the eager reconnect never fires (#7862). Wait for
 * the provider to appear — via an EIP-6963 announcement or a short poll — before
 * connecting, giving up after a timeout so we never hang.
 */
function autoConnectInjectedWhenReady(): void {
  const connect = (): void => {
    void connectWalletById('injected', 'injected')
  }

  if (window.ethereum) {
    connect()
    return
  }

  const TIMEOUT_MS = 3000
  const POLL_INTERVAL_MS = 100
  let settled = false

  const stop = (): void => {
    settled = true
    window.removeEventListener('eip6963:announceProvider', onProviderReady)
    clearInterval(pollId)
    clearTimeout(timeoutId)
  }

  function onProviderReady(): void {
    if (settled || !window.ethereum) return
    stop()
    connect()
  }

  window.addEventListener('eip6963:announceProvider', onProviderReady)
  const pollId = setInterval(onProviderReady, POLL_INTERVAL_MS)
  const timeoutId = setTimeout(stop, TIMEOUT_MS)
  // Prompt EIP-6963 providers to (re-)announce themselves so we react as soon as possible.
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

/**
 * Instantly connect to Safe if in Safe
 */
if (isSafeApp) {
  connectWalletById(SAFE_CONNECTOR_ID, 'safe')
} else if (hasRecentConnector && isMobile) {
  autoConnectInjectedWhenReady()
}

bindActiveProvider(wagmiAdapter)

const { wagmiConfig } = wagmiAdapter

export { wagmiConfig, wagmiAdapter, reownAppKit, wagmiStorage }
