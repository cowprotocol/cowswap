import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { createAppKit, type AppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider, http } from 'viem'
import { createConfig, createStorage, type Config, type Transport } from 'wagmi'

import { throttledInjected } from './connectors/throttledInjected'

import { COW_WIDGET_CONNECTOR_ID, SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

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

// Storage key per context to avoid cross-context state pollution.
const storageKey = !IS_CROSS_ORIGIN_IFRAME
  ? 'cowswap-wallet'
  : isInjectedWidget()
    ? 'cowswap-wallet' + COW_WIDGET_CONNECTOR_ID
    : 'cowswap-wallet-safe'

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        storage: window.localStorage,
        key: storageKey,
      })

// ---------------------------------------------------------------------------
// Safe App iframe path — lightweight wagmi-only config, no AppKit.
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
// Widget iframe path — full AppKit + widget connector.
//
// The widget runs cross-origin (same IS_CROSS_ORIGIN_IFRAME as Safe App) but
// needs AppKit for its wallet modal. Uses the WidgetEthereumProvider to forward
// the parent dapp's wallet, plus a Safe connector for widget-configurator hosted
// inside a Safe App.
// ---------------------------------------------------------------------------

function createWidgetConfig(): { config: Config; wagmiAdapter: WagmiAdapter; reownAppKit: AppKit } {
  const customRpcUrls: Record<string, Array<{ url: string }>> = {}
  for (const chain of SUPPORTED_REOWN_NETWORKS) {
    const url = RPC_URLS[chain.id as SupportedChainId]
    if (url) {
      customRpcUrls[`eip155:${chain.id}`] = [{ url }]
    }
  }

  const connectorParams = { shimDisconnect: true }

  const adapter = new WagmiAdapter({
    connectors: [
      injected({
        ...connectorParams,
        target: {
          name: 'CoW Widget',
          id: COW_WIDGET_CONNECTOR_ID,
          provider: new WidgetEthereumProvider() as EIP1193Provider,
        },
      }),
      injected(connectorParams),
      // Include Safe connector so the widget can auto-connect when hosted inside a Safe app
      // (e.g. widget-configurator loaded as a Safe App). IframeSafeSdkBridge in widget-lib
      // already forwards the Safe SDK postMessages through the configurator to app.safe.global.
      safe(connectorParams),
    ] as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
    customRpcUrls,
    networks: SUPPORTED_REOWN_NETWORKS,
    projectId,
    storage,
    transports: wagmiTransports,
  })

  // Recent connector takes priority — override it so the widget connector is always preferred.
  storage.setItem('recentConnectorId', COW_WIDGET_CONNECTOR_ID)

  // Prevent the CoW Widget connector from appearing in the wallet modal.
  // It must remain registered with wagmi (for reconnect/connect to work) but should not be
  // shown as an option — users connect via the parent dapp's wallet, not by picking a wallet manually.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _addWagmiConnector = (adapter as any).addWagmiConnector.bind(adapter)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(adapter as any).addWagmiConnector = async (connector: { id: string }) => {
    if (connector.id === COW_WIDGET_CONNECTOR_ID) return
    return _addWagmiConnector(connector)
  }

  const appKit = createAppKit({
    adapters: [adapter],
    allowUnsupportedChain: true,
    customRpcUrls,
    defaultNetwork: VIEM_CHAINS[getCurrentChainIdFromUrl()],
    enableEIP6963: !isImTokenBrowser,
    enableReconnect: true,
    enableWalletGuide: false,
    featuredWalletIds: [
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
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

// ---------------------------------------------------------------------------
// Regular tab path — full AppKit + WagmiAdapter setup.
// ---------------------------------------------------------------------------

function createRegularConfig(): { config: Config; wagmiAdapter: WagmiAdapter; reownAppKit: AppKit } {
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

const result = !IS_CROSS_ORIGIN_IFRAME
  ? createRegularConfig()
  : isInjectedWidget()
    ? createWidgetConfig()
    : createIframeConfig()

export const config = result.config
export const wagmiAdapter = result.wagmiAdapter
export const reownAppKit = result.reownAppKit
