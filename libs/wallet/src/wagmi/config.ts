import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { safe } from '@wagmi/connectors'
import { http } from 'viem'
import { createStorage, type Transport } from 'wagmi'

import { throttledInjected } from './connectors/throttledInjected'

import { SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

type ConnectorInstance = ReturnType<typeof safe> | ReturnType<typeof throttledInjected>

// Detect if we're embedded in a cross-origin iframe (e.g. Safe).
// Same-origin iframes (browser extensions like Loom, 1Password) can access parent.location —
// only cross-origin iframes (Safe) throw a SecurityError.
// Evaluated once at module load to avoid inconsistencies from extensions toggling iframe state.
export const IS_CROSS_ORIGIN_IFRAME = (() => {
  if (typeof window === 'undefined' || window.self === window.top) return false

  try {
    void window.parent.location.href
    return false
  } catch {
    return true
  }
})()

function isEmbeddedInIframe(): boolean {
  return IS_CROSS_ORIGIN_IFRAME
}

function getConnectors(): ConnectorInstance[] {
  const injected = throttledInjected()
  if (isEmbeddedInIframe()) {
    return [safe({ shimDisconnect: true }), injected]
  }
  return [injected]
}

const wagmiTransports = SUPPORTED_REOWN_NETWORKS.reduce(
  (acc, chain) => {
    const chainId = chain.id as SupportedChainId
    const url = RPC_URLS[chainId]
    if (url) {
      acc[chainId] = http(url)
    }
    return acc
  },
  {} as Record<SupportedChainId, Transport>,
)

/** CAIP-shaped RPCs for AppKit UI / network metadata (pairs with `wagmiTransports`). */
const customRpcUrls: Record<string, Array<{ url: string }>> = {}
for (const chain of SUPPORTED_REOWN_NETWORKS) {
  const url = RPC_URLS[chain.id as SupportedChainId]
  if (url) {
    customRpcUrls[`eip155:${chain.id}`] = [{ url }]
  }
}

const isIframe = isEmbeddedInIframe()

// On the regular tab, remove @appkit/connection_status if it's "disconnected".
// The Safe iframe (or a previous failed connection) may have left this, preventing new connections.
if (typeof window !== 'undefined' && !isIframe) {
  if (localStorage.getItem('@appkit/connection_status') === 'disconnected') {
    localStorage.removeItem('@appkit/connection_status')
  }
}

// In Safe iframe, redirect AppKit's @appkit/* localStorage operations to sessionStorage.
// This prevents the iframe from polluting the regular tab's AppKit state (wallet_id, connection_status, etc.)
// which causes the regular tab to fail when connecting MetaMask.
// Uses IS_CROSS_ORIGIN_IFRAME (not window.self !== window.top) so browser extensions like Loom
// don't trigger this redirect.
if (typeof window !== 'undefined' && isIframe) {
  const origSetItem = localStorage.setItem.bind(localStorage)
  const origGetItem = localStorage.getItem.bind(localStorage)
  const origRemoveItem = localStorage.removeItem.bind(localStorage)

  localStorage.setItem = (key: string, value: string) => {
    if (key.startsWith('@appkit/')) {
      sessionStorage.setItem(key, value)
    } else {
      origSetItem(key, value)
    }
  }
  localStorage.getItem = (key: string): string | null => {
    if (key.startsWith('@appkit/')) {
      return sessionStorage.getItem(key)
    }
    return origGetItem(key)
  }
  localStorage.removeItem = (key: string) => {
    if (key.startsWith('@appkit/')) {
      sessionStorage.removeItem(key)
    } else {
      origRemoveItem(key)
    }
  }
}

const projectId = 'ac287751638b5d374a03c39e37f70376'

const WAGMI_STORAGE_KEY = isIframe ? 'cowswap-wallet-safe' : 'cowswap-wallet'

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        storage: window.localStorage,
        key: WAGMI_STORAGE_KEY,
      })

const metadata = {
  name: 'CoW Swap | The smartest way to trade cryptocurrencies',
  description:
    'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
  url: 'https://swap.cow.fi',
  icons: ['https://swap.cow.fi/apple-touch-icon.png'],
}

export const wagmiAdapter = new WagmiAdapter({
  connectors: getConnectors() as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
  customRpcUrls,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  storage,
  transports: wagmiTransports,
})

export const config = wagmiAdapter.wagmiConfig

export const reownAppKit = createAppKit({
  adapters: [wagmiAdapter],
  allowUnsupportedChain: true,
  customRpcUrls,
  defaultNetwork: VIEM_CHAINS[getCurrentChainIdFromUrl()],
  // Disable EIP-6963 inside imToken's browser: AppKit's EIP-6963 path calls eth_requestAccounts
  // through too many async layers, losing the iOS WebKit gesture context — the call hangs forever.
  // imToken is instead featured as a WalletConnect option (featuredWalletIds) so it appears on
  // the first modal screen, and the WalletConnect path works correctly inside imToken's browser.
  enableEIP6963: !isImTokenBrowser,
  enableReconnect: true,
  enableWalletGuide: false,
  featuredWalletIds: [
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    // imToken — shown prominently so users inside imToken's browser can find the WalletConnect path
    'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef',
  ],
  features: {
    analytics: false,
    email: false,
    socials: false,
    connectorTypeOrder: ['injected', 'recent', 'walletConnect'],
  },
  metadata,
  networks: SUPPORTED_REOWN_NETWORKS,
  projectId,
  termsConditionsUrl:
    'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
})
