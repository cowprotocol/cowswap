import type { EIP1193EventMap, EIP1193Provider } from 'viem'

/**
 * Sentinel value meaning "the user has explicitly disconnected (or connected then disconnected)".
 * In this state, all accountsChanged events are blocked to prevent wallets from
 * auto-reconnecting disconnected tabs when the user switches accounts in the extension.
 *
 * Distinguished from `null` which means "no connector established yet" (initial page load),
 * where events must pass through for reconnection to work.
 */
export const PROVIDER_DISCONNECTED: unique symbol = Symbol('PROVIDER_DISCONNECTED')

/**
 * Tracks which isolated provider is currently active in this tab (in-memory, per-tab).
 * Updated by config.ts whenever config.state.current changes.
 * Used by createIsolatedProvider to filter accountsChanged events.
 *
 * - `null`: initial state, no connector established yet — events pass through
 * - `PROVIDER_DISCONNECTED`: user disconnected — events are blocked
 * - `EIP1193Provider`: active provider — only events from this provider pass through
 */
export const activeProviderRef: { current: EIP1193Provider | typeof PROVIDER_DISCONNECTED | null } = { current: null }

type Eip6963ProviderInfo = { name?: string; rdns?: string }
type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo
  provider: EIP1193Provider
}
type DeferredBraveWalletAnnouncement = {
  info: Eip6963ProviderInfo
  event: CustomEvent<Eip6963ProviderDetail>
}

// Cache isolated providers by their original so identity is stable across calls.
const cache = new WeakMap<object, EIP1193Provider>()

/**
 * Wraps an EIP-1193 provider to enforce tab-level wallet isolation:
 *
 * 1. Blocks `wallet_revokePermissions` — wagmi calls this on disconnect, but it revokes
 *    permissions for the *entire origin* (all tabs), not just the current tab.
 *    shimDisconnect is sufficient to prevent reconnect on next page load.
 *
 * 2. Filters `accountsChanged` events — only forwards them when this provider is the
 *    active one in this tab, preventing a wallet switch in Tab A from affecting Tab B.
 */
export function createIsolatedProvider(original: EIP1193Provider): EIP1193Provider {
  const cached = cache.get(original as object)
  if (cached) return cached

  // Maps original listener → wrapped listener so removeListener works correctly.
  type AccountsChangedListener = EIP1193EventMap['accountsChanged']
  const listenerMap = new Map<AccountsChangedListener, AccountsChangedListener>()

  const proxy: EIP1193Provider = {
    request: (async (args) => {
      const method = (args as { method: string }).method
      if (method === 'wallet_revokePermissions') {
        console.log('[providerIsolation] blocked wallet_revokePermissions')
        return null
      }
      return original.request(args as unknown as Parameters<typeof original.request>[0])
    }) as EIP1193Provider['request'],

    on: <event extends keyof EIP1193EventMap>(event: event, listener: EIP1193EventMap[event]): void => {
      if (event === 'accountsChanged') {
        const wrapped: AccountsChangedListener = (accounts) => {
          const active = activeProviderRef.current

          // PROVIDER_DISCONNECTED: user explicitly disconnected — block all events to
          // prevent wallets from auto-reconnecting when accounts change in the extension.
          if (active === PROVIDER_DISCONNECTED) return

          // null: initial page load, no connector established yet — let events through
          // so wagmi's reconnection can receive account updates.
          // EIP1193Provider: only forward events for the active provider to enforce
          // tab-level isolation (wallet switch in Tab A shouldn't affect Tab B).
          if (active !== null && active !== proxy) return
          ;(listener as unknown as AccountsChangedListener)(accounts)
        }
        listenerMap.set(listener as unknown as AccountsChangedListener, wrapped)
        original.on('accountsChanged', wrapped)
      } else {
        original.on(event, listener as unknown as EIP1193EventMap[event])
      }
    },

    removeListener: <event extends keyof EIP1193EventMap>(event: event, listener: EIP1193EventMap[event]): void => {
      if (event === 'accountsChanged') {
        const wrapped = listenerMap.get(listener as unknown as AccountsChangedListener)
        if (wrapped) {
          original.removeListener('accountsChanged', wrapped)
          listenerMap.delete(listener as unknown as AccountsChangedListener)
        } else {
          original.removeListener('accountsChanged', listener as unknown as AccountsChangedListener)
        }
      } else {
        original.removeListener(event, listener as unknown as EIP1193EventMap[event])
      }
    },
  }

  cache.set(original as object, proxy)
  return proxy
}

// Guards stored on `window` so they survive HMR — module-local variables are
// reset on hot reload, but the capture listener stays attached to `window`.
// Without this, each HMR reload would add another listener and the two instances
// could re-dispatch events back and forth.
type IsolationWindow = Window & {
  __cowEip6963InterceptRegistered?: boolean
  __cowEip6963ReDispatched?: WeakSet<Event>
  __cowEip6963DeferredBraveWallet?: DeferredBraveWalletAnnouncement[]
  __cowEip6963AnnounceProviderListener?: EventListener
}

function getReDispatched(): WeakSet<Event> {
  const win = window as IsolationWindow
  if (!win.__cowEip6963ReDispatched) {
    win.__cowEip6963ReDispatched = new WeakSet<Event>()
  }
  return win.__cowEip6963ReDispatched
}

function getDeferredBraveWalletAnnouncements(): DeferredBraveWalletAnnouncement[] {
  const win = window as IsolationWindow
  if (!win.__cowEip6963DeferredBraveWallet) {
    win.__cowEip6963DeferredBraveWallet = []
  }
  return win.__cowEip6963DeferredBraveWallet
}

function getProviderIdentifier(info: Eip6963ProviderInfo): string {
  return info.rdns ?? info.name ?? 'unknown'
}

function isBraveWalletInfo(info: Eip6963ProviderInfo): boolean {
  return info.rdns === 'com.brave.wallet' || info.name === 'Brave Wallet'
}

function createIsolatedProviderAnnouncement(detail: Eip6963ProviderDetail): CustomEvent<Eip6963ProviderDetail> {
  const newEvent = new CustomEvent<Eip6963ProviderDetail>('eip6963:announceProvider', {
    detail: { info: detail.info, provider: createIsolatedProvider(detail.provider) },
  })
  getReDispatched().add(newEvent)

  return newEvent
}

function deferBraveWalletAnnouncement(info: Eip6963ProviderInfo, event: CustomEvent<Eip6963ProviderDetail>): void {
  const deferred = getDeferredBraveWalletAnnouncements()
  const identifier = getProviderIdentifier(info)
  const replacementIndex = deferred.findIndex((announcement) => getProviderIdentifier(announcement.info) === identifier)
  const announcement = { info, event }

  if (replacementIndex >= 0) {
    deferred[replacementIndex] = announcement
  } else {
    deferred.push(announcement)
  }
}

/**
 * Dispatches Brave Wallet EIP-6963 announcements that were hidden during page load.
 * Call this only from an explicit wallet-selection path; materializing the Brave
 * provider at startup can crash Brave's renderer process.
 */
export function flushDeferredProviders(): void {
  if (typeof window === 'undefined') return

  const deferred = getDeferredBraveWalletAnnouncements()
  if (deferred.length === 0) return

  for (const announcement of deferred.splice(0)) {
    const event = createIsolatedProviderAnnouncement({
      info: announcement.info,
      provider: announcement.event.detail.provider,
    })
    window.dispatchEvent(event)
  }
}

/**
 * Registers a capture-phase listener for EIP-6963 provider announcements so that
 * every wallet provider is wrapped with createIsolatedProvider *before* wagmi/AppKit
 * processes it and creates connectors.
 *
 * Must be called before WagmiAdapter / createConfig is instantiated.
 * Safe to call multiple times — only registers the listener once (survives HMR).
 */
export function interceptEIP6963Providers(): void {
  if (typeof window === 'undefined') return
  const win = window as IsolationWindow
  if (win.__cowEip6963InterceptRegistered) return
  win.__cowEip6963InterceptRegistered = true
  const announceProviderListener = ((event: Event): void => {
    const reDispatched = getReDispatched()
    if (reDispatched.has(event)) return
    event.stopImmediatePropagation()

    const customEvent = event as CustomEvent<Eip6963ProviderDetail>
    const detail = customEvent.detail

    if (isBraveWalletInfo(detail.info)) {
      deferBraveWalletAnnouncement(detail.info, customEvent)
      return
    }

    const newEvent = createIsolatedProviderAnnouncement(detail)
    window.dispatchEvent(newEvent)
  }) satisfies EventListener
  win.__cowEip6963AnnounceProviderListener = announceProviderListener
  window.addEventListener('eip6963:announceProvider', announceProviderListener, { capture: true })
}
