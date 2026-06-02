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
  if (cached) {
    console.log('[providerIsolation] reusing cached proxy for provider', original)
    return cached
  }

  console.log('[providerIsolation] creating isolated proxy for provider', original)

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
}

type Eip6963ProviderDetail = {
  info: { name?: string; rdns?: string }
  provider: EIP1193Provider
}

function getReDispatched(): WeakSet<Event> {
  const win = window as IsolationWindow
  if (!win.__cowEip6963ReDispatched) {
    win.__cowEip6963ReDispatched = new WeakSet<Event>()
  }
  return win.__cowEip6963ReDispatched
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

  console.log('[providerIsolation] interceptEIP6963Providers: capture listener registered')

  window.addEventListener(
    'eip6963:announceProvider',
    (event) => {
      const reDispatched = getReDispatched()
      if (reDispatched.has(event)) return
      event.stopImmediatePropagation()

      const detail = (event as CustomEvent<Eip6963ProviderDetail>).detail

      console.log(
        '[providerIsolation] intercepted eip6963:announceProvider for',
        detail.info?.name ?? detail.info?.rdns,
      )

      const newEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info: detail.info, provider: createIsolatedProvider(detail.provider) }),
      })
      reDispatched.add(newEvent)
      window.dispatchEvent(newEvent)
    },
    { capture: true },
  )
}
