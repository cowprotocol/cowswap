import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isImTokenBrowser, isInjectedWidget } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { injected, safe } from '@wagmi/connectors'
import { EIP1193Provider, http } from 'viem'
import { createConfig, createStorage, type Config, type Transport } from 'wagmi'

import { activeProviderRef, interceptEIP6963Providers, PROVIDER_DISCONNECTED } from './providerIsolation'

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

// Redirect AppKit's @appkit/* localStorage keys to sessionStorage on ALL pages.
// sessionStorage is per-tab but survives page refreshes, giving us:
//  - Tab isolation: connecting MetaMask in Tab B won't overwrite Rabby in Tab A
//  - Refresh persistence: reloading a tab keeps the wallet connected
// In cross-origin iframes this also prevents the regular app's storage events from
// leaking into the iframe. We patch Storage.prototype (not the localStorage instance)
// because browsers may ignore own-property overrides on native host objects.
if (typeof window !== 'undefined' && !(Storage.prototype as unknown as { __isCowPatched?: boolean }).__isCowPatched) {
  ;(Storage.prototype as unknown as { __isCowPatched: boolean }).__isCowPatched = true

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

// Intercept EIP-6963 provider announcements before wagmi/AppKit processes them so
// every wallet provider gets wrapped with tab-isolation logic (no wallet_revokePermissions,
// filtered accountsChanged). Must run before WagmiAdapter / createConfig is instantiated.
interceptEIP6963Providers()

function getConnectors(): ConnectorInstance[] {
  if (IS_CROSS_ORIGIN_IFRAME) {
    if (isInjectedWidget()) {
      // No plain `injected` connector here — MetaMask is a per-origin singleton, so registering
      // it would leak wallet state between the widget and the main app (connecting in one
      // auto-connects the other). The widget connects via WidgetEthereumProvider (dapp mode)
      // or WalletConnect (standalone mode) instead.
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

  // EIP-6963 wallets (Rabby, MetaMask, etc.) are already wrapped with tab-isolation
  // by interceptEIP6963Providers(). The plain injected connector is only a fallback for
  // legacy wallets that don't support EIP-6963 — keep it simple so wagmi's built-in
  // provider discovery and reconnection work correctly.
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
  ? 'cowswap-wallet-' + COW_WIDGET_CONNECTOR_ID
  : IS_CROSS_ORIGIN_IFRAME
    ? 'cowswap-wallet-safe'
    : 'cowswap-wallet'

const storage =
  typeof window === 'undefined'
    ? createStorage({
        storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      })
    : createStorage({
        // sessionStorage is per-tab but survives refreshes — each tab keeps its own
        // wallet connection without cross-tab interference (e.g. Tab A stays on Rabby
        // even if Tab B switches to MetaMask).
        storage: window.sessionStorage,
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

// `batch.multicall` collapses concurrent single `useReadContract` calls into one
// multicall3 aggregate3 — the dominant savings for our `eth_call` budget (otherwise
// each singular contract read is its own RPC call).
// `pollingInterval` overrides viem's 4s default so block-driven hooks (BlockNumberProvider,
// useReadContracts refetches) poll once per ~mainnet block time. Cowswap's UX tolerates
// the L2 staleness this introduces because trades settle on the protocol's batch cadence.
const VIEM_CLIENT_TUNING = {
  batch: {
    multicall: {
      wait: 130, //  coalescing window in ms
      batchSize: 30_000, // calldata size ceiling (30kb)
    },
  },
  // Frequency (in ms) for polling enabled actions & events.
  pollingInterval: 12_000,
} as const

if (isSafeIframe) {
  // Safe App iframe: no AppKit — use a plain wagmi config with only the Safe connector.
  config = createConfig({
    ...VIEM_CLIENT_TUNING,
    connectors,
    chains: SUPPORTED_REOWN_NETWORKS,
    storage,
    transports: wagmiTransports,
  })
} else {
  wagmiAdapter = new WagmiAdapter({
    ...VIEM_CLIENT_TUNING,
    connectors: connectors as ConstructorParameters<typeof WagmiAdapter>[0]['connectors'],
    customRpcUrls,
    networks: SUPPORTED_REOWN_NETWORKS,
    projectId,
    storage,
    transports: wagmiTransports,
  })

  config = wagmiAdapter.wagmiConfig

  const RECENT_CONNECTOR_KEY = 'recentConnectorId'
  if (isInjectedWidget()) {
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
    enableEIP6963: !isImTokenBrowser,
    enableReconnect: !isInjectedWidget(),
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

// Wagmi's `<Hydrate>` (wrapped by WagmiProvider) calls `hydrate.onMount` synchronously
// on every render. With `reconnectOnMount={false}` (used so SafeConnectionHandler can
// take over without racing against an auto-reconnect), onMount runs:
//   config.setState((x) => ({ ...x, connections: new Map() }))
// which clears `connections` but leaves `status` and `current` alone. Once our manual
// reconnect has set `status: 'connected'`, the next re-render of WagmiProvider wipes
// the connections map and the store ends up with status='connected' but empty
// connections — `getConnection()` then returns `{ status: 'connected', connector: undefined }`,
// and @reown/appkit-adapter-wagmi's watchAccount crashes reading `accountData.connector.id`.
//
// Enforce the invariant ourselves by wrapping `config.setState`: if the next state has
// empty connections, force status='disconnected' and current=null in the same write so
// the inconsistent state is never observed by any subscriber.
const _wagmiSetState = config.setState.bind(config)
config.setState = ((value: Parameters<typeof config.setState>[0]) => {
  return _wagmiSetState((current) => {
    const next = typeof value === 'function' ? value(current) : value
    if (next && typeof next === 'object' && 'connections' in next) {
      const { connections, status } = next as { connections?: Map<unknown, unknown>; status?: string }
      if (connections && connections.size === 0 && status === 'connected') {
        return { ...next, status: 'disconnected', current: null }
      }
    }
    return next
  })
}) as typeof config.setState

// Keep activeProviderRef in sync with the active connector so the per-tab
// accountsChanged filter in providerIsolation.ts knows which provider is current.
if (typeof window !== 'undefined') {
  let hasEverConnected = false
  let syncVersion = 0

  config.subscribe(
    (state) => state.current,
    async (current) => {
      const version = ++syncVersion

      if (!current) {
        // Distinguish "never connected yet" (null, let events through for reconnection)
        // from "was connected, now disconnected" (PROVIDER_DISCONNECTED, block events).
        activeProviderRef.current = hasEverConnected ? PROVIDER_DISCONNECTED : null
        return
      }
      hasEverConnected = true
      const connector = config.connectors.find((c) => c.uid === current)
      if (!connector) {
        activeProviderRef.current = PROVIDER_DISCONNECTED
        return
      }
      const provider = (await connector.getProvider().catch(() => null)) as EIP1193Provider | null

      // Ignore stale resolution — a newer subscribe call may have fired while we awaited.
      if (version !== syncVersion) return

      activeProviderRef.current = provider
    },
    { emitImmediately: true },
  )
}

export { wagmiAdapter, reownAppKit, config }
