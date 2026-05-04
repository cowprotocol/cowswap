import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { createAppKit, type AppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { safe } from '@wagmi/connectors'
import { http } from 'viem'
import { createConfig, createStorage, type Config, type Transport } from 'wagmi'

import { throttledInjected } from './connectors/throttledInjected'

import { SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

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

const projectId = 'ac287751638b5d374a03c39e37f70376'

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        storage: window.localStorage,
        key: IS_CROSS_ORIGIN_IFRAME ? 'cowswap-wallet-safe' : 'cowswap-wallet',
      })

// ---------------------------------------------------------------------------
// Iframe (Safe App) path — lightweight wagmi-only config, no AppKit.
//
// AppKit brings EIP-6963 discovery, injected connector management, reconnection
// logic, localStorage state syncing, etc. All of this interferes with the Safe
// iframe because window.ethereum and localStorage are shared with the regular
// browser tab. Instead of monkey-patching each interference point, we simply
// don't instantiate AppKit in the iframe. SafeConnectionHandler manages the
// Safe connector directly via wagmi core.
// ---------------------------------------------------------------------------

function createIframeConfig(): { config: Config; wagmiAdapter: WagmiAdapter | null; reownAppKit: AppKit | null } {
  const chains = SUPPORTED_REOWN_NETWORKS
  const config = createConfig({
    chains,
    connectors: [safe({ shimDisconnect: true })],
    multiInjectedProviderDiscovery: false,
    storage,
    transports: Object.fromEntries(chains.map((chain) => [chain.id, wagmiTransports[chain.id as SupportedChainId]])),
  })

  return { config, wagmiAdapter: null, reownAppKit: null }
}

// ---------------------------------------------------------------------------
// Regular tab path — full AppKit + WagmiAdapter setup.
// ---------------------------------------------------------------------------

function createRegularConfig(): { config: Config; wagmiAdapter: WagmiAdapter; reownAppKit: AppKit } {
  /** CAIP-shaped RPCs for AppKit UI / network metadata. */
  const customRpcUrls: Record<string, Array<{ url: string }>> = {}
  for (const chain of SUPPORTED_REOWN_NETWORKS) {
    const url = RPC_URLS[chain.id as SupportedChainId]
    if (url) {
      customRpcUrls[`eip155:${chain.id}`] = [{ url }]
    }
  }

  const adapter = new WagmiAdapter({
    connectors: [throttledInjected()] as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
    customRpcUrls,
    networks: SUPPORTED_REOWN_NETWORKS,
    projectId,
    storage,
    transports: wagmiTransports,
  })

  const appKit = createAppKit({
    adapters: [adapter],
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
    metadata: {
      name: 'CoW Swap | The smartest way to trade cryptocurrencies',
      description:
        'CoW Swap finds the lowest prices from all decentralized exchanges and DEX aggregators & saves you more with p2p trading and protection from MEV',
      url: 'https://swap.cow.fi',
      icons: ['https://swap.cow.fi/apple-touch-icon.png'],
    },
    networks: SUPPORTED_REOWN_NETWORKS,
    projectId,
    termsConditionsUrl:
      'https://cow.fi/legal/cowswap-terms?utm_source=swap.cow.fi&utm_medium=web&utm_content=wallet-modal-terms-link',
  })

  return { config: adapter.wagmiConfig, wagmiAdapter: adapter, reownAppKit: appKit }
}

const result = IS_CROSS_ORIGIN_IFRAME ? createIframeConfig() : createRegularConfig()

export const config = result.config
export const wagmiAdapter = result.wagmiAdapter
export const reownAppKit = result.reownAppKit
