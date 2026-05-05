import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider, http } from 'viem'
import { createConfig, createStorage, type Config, type Transport } from 'wagmi'

import { COW_WIDGET_CONNECTOR_ID, SUPPORTED_REOWN_NETWORKS } from '../reown/consts'

type ConnectorInstance = ReturnType<typeof safe> | ReturnType<typeof injected>

/**
 * True when the app is running inside a cross-origin iframe (e.g. Safe App).
 * Accessing window.parent.location.href throws a SecurityError for cross-origin frames.
 * Same-origin iframes (e.g. local dev) do not throw.
 */
export const IS_CROSS_ORIGIN_IFRAME = (() => {
  if (typeof window === 'undefined' || window.self === window.top) return false
  try {
    void window.parent.location.href
    return false
  } catch {
    return true
  }
})()

// Safe App iframe: skip AppKit — it interferes with Safe's postMessage flow.
// The widget needs AppKit for the standalone-mode wallet modal, so it keeps AppKit
// but with localStorage isolation (see below) to avoid cross-context state leaks.
const isSafeIframe = IS_CROSS_ORIGIN_IFRAME && !isInjectedWidget()

// Isolate AppKit's @appkit/* localStorage keys in the widget iframe.
// The widget and the main app share the same origin (= same localStorage). Without isolation,
// AppKit syncs state via `storage` events: connecting in the widget auto-connects the app,
// and disconnecting from the app disconnects the widget.
//
// We patch Storage.prototype (not the localStorage instance) because browsers may ignore
// own-property overrides on native host objects like localStorage. AppKit's SafeLocalStorage
// calls `localStorage.setItem()` which resolves through Storage.prototype.
if (typeof window !== 'undefined' && isInjectedWidget()) {
  // Patch Storage.prototype to redirect @appkit/* on localStorage to sessionStorage.
  // Don't clear @appkit/* keys from localStorage — that would wipe the main app's state.
  const origSetItem = Storage.prototype.setItem
  const origGetItem = Storage.prototype.getItem
  const origRemoveItem = Storage.prototype.removeItem

  Storage.prototype.setItem = function (key: string, value: string) {
    if (this === localStorage && key.startsWith('@appkit/')) {
      origSetItem.call(sessionStorage, key, value)
    } else {
      origSetItem.call(this, key, value)
    }
  }
  Storage.prototype.getItem = function (key: string): string | null {
    if (this === localStorage && key.startsWith('@appkit/')) {
      return origGetItem.call(sessionStorage, key)
    }
    return origGetItem.call(this, key)
  }
  Storage.prototype.removeItem = function (key: string) {
    if (this === localStorage && key.startsWith('@appkit/')) {
      origRemoveItem.call(sessionStorage, key)
    } else {
      origRemoveItem.call(this, key)
    }
  }
}

function getConnectors(): ConnectorInstance[] {
  if (IS_CROSS_ORIGIN_IFRAME) {
    if (isInjectedWidget()) {
      return [
        injected({
          shimDisconnect: true,
          target: {
            name: 'CoW Widget',
            id: COW_WIDGET_CONNECTOR_ID,
            provider: new WidgetEthereumProvider() as EIP1193Provider,
          },
        }),
        // Include Safe connector so the widget can auto-connect when hosted inside a Safe app
        // (e.g. widget-configurator loaded as a Safe App). IframeSafeSdkBridge in widget-lib
        // already forwards the Safe SDK postMessages through the configurator to app.safe.global.
        safe({ shimDisconnect: true }),
      ]
    }

    return [safe({ shimDisconnect: true }), injected({ shimDisconnect: true })]
  }

  return [injected({ shimDisconnect: true })]
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

const projectId = 'ac287751638b5d374a03c39e37f70376'

// Use a distinct storage key per context to avoid cross-context session pollution.
const WAGMI_STORAGE_KEY = isInjectedWidget()
  ? 'cowswap-wallet' + COW_WIDGET_CONNECTOR_ID
  : IS_CROSS_ORIGIN_IFRAME
    ? 'cowswap-wallet-safe'
    : 'cowswap-wallet'

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

const connectors = getConnectors()

let wagmiAdapter: WagmiAdapter | null = null
let reownAppKit: ReturnType<typeof createAppKit> | null = null
let config: Config

if (isSafeIframe) {
  // Safe App iframe: no AppKit — use a plain wagmi config with only the Safe connector.
  config = createConfig({
    connectors,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chains: SUPPORTED_REOWN_NETWORKS as any,
    storage,
    transports: wagmiTransports,
  })
} else {
  wagmiAdapter = new WagmiAdapter({
    connectors: connectors as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
    customRpcUrls,
    networks: SUPPORTED_REOWN_NETWORKS,
    projectId,
    storage,
    transports: wagmiTransports,
  })

  config = wagmiAdapter.wagmiConfig

  if (isInjectedWidget()) {
    const RECENT_CONNECTOR_KEY = 'recentConnectorId'
    // Recent connector takes priority, and we have to override it in the widget
    storage.setItem(RECENT_CONNECTOR_KEY, COW_WIDGET_CONNECTOR_ID)

    // Prevent the CoW Widget connector from appearing in the wallet modal.
    // It must remain registered with wagmi (for reconnect/connect to work) but should not be
    // shown as an option — users connect via the parent dapp's wallet, not by picking a wallet manually.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _addWagmiConnector = (wagmiAdapter as any).addWagmiConnector.bind(wagmiAdapter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(wagmiAdapter as any).addWagmiConnector = async (connector: { id: string }) => {
      if (connector.id === COW_WIDGET_CONNECTOR_ID) return
      return _addWagmiConnector(connector)
    }
  }

  reownAppKit = createAppKit({
    adapters: [wagmiAdapter],
    allowUnsupportedChain: true,
    customRpcUrls,
    defaultNetwork: VIEM_CHAINS[getCurrentChainIdFromUrl()],
    // Disable EIP-6963 inside imToken's browser: AppKit's EIP-6963 path calls eth_requestAccounts
    // through too many async layers, losing the iOS WebKit gesture context — the call hangs forever.
    // imToken is instead featured as a WalletConnect option (featuredWalletIds) so it appears on
    // the first modal screen, and the WalletConnect path works correctly inside imToken's browser.
    // Disable EIP-6963 in the widget — MetaMask is a per-origin singleton, so EIP-6963
    // auto-detection would pick up MetaMask's state from the main app tab, causing
    // cross-context connection leaks.
    enableEIP6963: !isImTokenBrowser && !isInjectedWidget(),
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
}

export { wagmiAdapter, reownAppKit, config }
