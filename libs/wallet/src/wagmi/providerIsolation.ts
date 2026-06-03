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

/**
 * Set to true once the initial wagmi reconnect() call has settled (resolved or rejected).
 * EIP-6963 provider announcements are deferred until this is true (or until the user
 * opens the wallet modal) to prevent Brave Wallet's slow extension IPC from triggering
 * React re-renders + OOM crashes during the initial page-load render cascade.
 */
let eip6963ReconnectSettled = false

// Cache isolated providers by their original so identity is stable across calls.
const cache = new WeakMap<object, EIP1193Provider>()

/**
 * Registry mapping EIP-6963 rdns → isolated proxy.
 * Populated by interceptEIP6963Providers() as wallets announce themselves.
 * Used by config.ts to set activeProviderRef synchronously without calling
 * connector.getProvider() (which can crash when the extension is in a bad state).
 */
export const proxyByRdns = new Map<string, EIP1193Provider>()

/**
 * Wraps an EIP-1193 provider to enforce tab-level wallet isolation:
 *
 * 1. Blocks `wallet_revokePermissions` — wagmi calls this on disconnect, but it revokes
 *    permissions for the *entire origin* (all tabs), not just the current tab.
 *    shimDisconnect is sufficient to prevent reconnect on next page load.
 *
 * 2. Filters `accountsChanged` events — only forwards them when this provider is the
 *    active one in this tab, preventing a wallet switch in Tab A from affecting Tab B.
 *
 * 3. Filters `chainChanged` events — only forwards them when this provider is the
 *    active one in this tab, preventing wallets with a different active chain (e.g. Brave
 *    Wallet on Gnosis Chain 100) from overriding the wagmi chain state of the user's
 *    actual active wallet and causing an infinite chain-switch / URL-navigation loop.
 */

// Methods that require user interaction in MetaMask's popup — these legitimately take
// seconds and must NOT trip the circuit breaker.
const USER_INTERACTION_METHODS = new Set([
  'eth_requestAccounts',
  'eth_sendTransaction',
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'wallet_switchEthereumChain',
  'wallet_addEthereumChain',
  'wallet_requestPermissions',
])

// Circuit breaker thresholds. Background calls (eth_chainId, eth_accounts, etc.) should
// resolve in <100ms under normal conditions. A >500ms response signals that MetaMask's
// service worker is restarting — during which its N accumulated broken stream instances
// process every subsequent call N times, amplifying IPC pressure until the renderer crashes.
const CIRCUIT_TRIP_MS = 500
const CIRCUIT_COOLDOWN_MS = 2000

type AccountsChangedListener = EIP1193EventMap['accountsChanged']
type ChainChangedListener = EIP1193EventMap['chainChanged']
type CircuitState = { openUntil: number }

// Returns a blocked response (with value to return) if the call should be intercepted.
function getBlockedResponse(method: string): { value: unknown } | undefined {
  if (method === 'wallet_revokePermissions') {
    console.log('[providerIsolation] blocked wallet_revokePermissions')
    return { value: null }
  }
  if (activeProviderRef.current === PROVIDER_DISCONNECTED && (method === 'eth_accounts' || method === 'eth_coinbase')) {
    console.log('[providerIsolation] blocked', method, '(PROVIDER_DISCONNECTED)')
    return { value: method === 'eth_coinbase' ? null : [] }
  }
}

// Returns true if events from `proxy` should be suppressed (wrong provider or disconnected).
function isProviderBlocked(proxy: EIP1193Provider): boolean {
  const active = activeProviderRef.current
  if (active === PROVIDER_DISCONNECTED) return true
  if (active !== null && active !== proxy) return true
  return false
}

function describeProvider(
  active: EIP1193Provider | typeof PROVIDER_DISCONNECTED | null,
  proxy: EIP1193Provider,
): string {
  if (active === PROVIDER_DISCONNECTED) return 'DISCONNECTED'
  if (active === null) return 'null'
  return active === proxy ? 'THIS' : 'OTHER'
}

function makeProxyRequestHandler(
  original: EIP1193Provider,
  pendingRequests: Map<string, Promise<unknown>>,
  circuit: CircuitState,
): EIP1193Provider['request'] {
  return (async (args) => {
    const method = (args as { method: string }).method
    const blocked = getBlockedResponse(method)
    if (blocked !== undefined) return blocked.value

    const now = Date.now()
    if (circuit.openUntil > now) {
      const remaining = circuit.openUntil - now
      console.log('[providerIsolation] circuit open, fast-failing', method, `(${remaining}ms remaining)`)
      throw new Error('[providerIsolation] circuit breaker open — MetaMask service worker restarting')
    }

    const key = JSON.stringify(args)
    const existing = pendingRequests.get(key)
    if (existing) {
      console.log('[providerIsolation] deduped concurrent request:', method)
      return existing
    }

    const startTime = Date.now()
    const promise = (
      original.request(args as unknown as Parameters<typeof original.request>[0]) as Promise<unknown>
    ).finally(() => {
      pendingRequests.delete(key)
      if (!USER_INTERACTION_METHODS.has(method)) {
        const elapsed = Date.now() - startTime
        if (elapsed > CIRCUIT_TRIP_MS) {
          circuit.openUntil = Date.now() + CIRCUIT_COOLDOWN_MS
          console.warn(
            '[providerIsolation] circuit tripped —',
            method,
            'took',
            elapsed,
            'ms; blocking provider calls for',
            CIRCUIT_COOLDOWN_MS,
            'ms',
          )
        }
      }
    })
    pendingRequests.set(key, promise)
    return promise
  }) as EIP1193Provider['request']
}

function makeOnHandler(
  original: EIP1193Provider,
  accountsListenerMap: Map<AccountsChangedListener, AccountsChangedListener>,
  chainListenerMap: Map<ChainChangedListener, ChainChangedListener>,
  getProxy: () => EIP1193Provider,
): EIP1193Provider['on'] {
  return (<event extends keyof EIP1193EventMap>(event: event, listener: EIP1193EventMap[event]): void => {
    if (event === 'accountsChanged') {
      const wrapped: AccountsChangedListener = (accounts) => {
        const proxy = getProxy()
        const active = activeProviderRef.current
        if (isProviderBlocked(proxy)) {
          console.log('[providerIsolation] BLOCKED accountsChanged', accounts, {
            active: describeProvider(active, proxy),
          })
          return
        }
        console.log('[providerIsolation] FORWARDING accountsChanged', accounts, {
          active: active === null ? 'null(initial)' : 'active-provider',
        })
        ;(listener as unknown as AccountsChangedListener)(accounts)
      }
      accountsListenerMap.set(listener as unknown as AccountsChangedListener, wrapped)
      original.on('accountsChanged', wrapped)
    } else if (event === 'chainChanged') {
      const wrapped: ChainChangedListener = (chainId) => {
        const proxy = getProxy()
        const active = activeProviderRef.current
        if (isProviderBlocked(proxy)) {
          console.log('[providerIsolation] BLOCKED chainChanged', chainId, { active: describeProvider(active, proxy) })
          return
        }
        console.log('[providerIsolation] FORWARDING chainChanged', chainId, {
          active: active === null ? 'null(initial)' : 'active-provider',
        })
        ;(listener as unknown as ChainChangedListener)(chainId)
      }
      chainListenerMap.set(listener as unknown as ChainChangedListener, wrapped)
      original.on('chainChanged', wrapped)
    } else {
      original.on(event, listener as unknown as EIP1193EventMap[event])
    }
  }) as EIP1193Provider['on']
}

function makeRemoveListenerHandler(
  original: EIP1193Provider,
  accountsListenerMap: Map<AccountsChangedListener, AccountsChangedListener>,
  chainListenerMap: Map<ChainChangedListener, ChainChangedListener>,
): EIP1193Provider['removeListener'] {
  return (<event extends keyof EIP1193EventMap>(event: event, listener: EIP1193EventMap[event]): void => {
    if (event === 'accountsChanged') {
      const wrapped = accountsListenerMap.get(listener as unknown as AccountsChangedListener)
      if (wrapped) {
        original.removeListener('accountsChanged', wrapped)
        accountsListenerMap.delete(listener as unknown as AccountsChangedListener)
      } else {
        original.removeListener('accountsChanged', listener as unknown as AccountsChangedListener)
      }
    } else if (event === 'chainChanged') {
      const wrapped = chainListenerMap.get(listener as unknown as ChainChangedListener)
      if (wrapped) {
        original.removeListener('chainChanged', wrapped)
        chainListenerMap.delete(listener as unknown as ChainChangedListener)
      } else {
        original.removeListener('chainChanged', listener as unknown as ChainChangedListener)
      }
    } else {
      original.removeListener(event, listener as unknown as EIP1193EventMap[event])
    }
  }) as EIP1193Provider['removeListener']
}

export function createIsolatedProvider(original: EIP1193Provider): EIP1193Provider {
  const cached = cache.get(original as object)
  if (cached) {
    console.log('[providerIsolation] reusing cached proxy for provider', original)
    return cached
  }

  console.log('[providerIsolation] creating isolated proxy for provider', original)

  const accountsListenerMap = new Map<AccountsChangedListener, AccountsChangedListener>()
  const chainListenerMap = new Map<ChainChangedListener, ChainChangedListener>()
  const pendingRequests = new Map<string, Promise<unknown>>()
  const circuit: CircuitState = { openUntil: 0 }

  // proxyRef lets makeOnHandler reference the proxy object before it's fully initialized,
  // since the wrapped listeners call isProviderBlocked(proxy) at invocation time (not creation).
  const proxyRef: { current: EIP1193Provider | null } = { current: null }

  const proxy: EIP1193Provider = {
    request: makeProxyRequestHandler(original, pendingRequests, circuit),
    on: makeOnHandler(original, accountsListenerMap, chainListenerMap, () => proxyRef.current!),
    removeListener: makeRemoveListenerHandler(original, accountsListenerMap, chainListenerMap),
  }
  proxyRef.current = proxy

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
  __cowEip6963Deferred?: CustomEvent[]
}

function getReDispatched(): WeakSet<Event> {
  const win = window as IsolationWindow
  if (!win.__cowEip6963ReDispatched) {
    win.__cowEip6963ReDispatched = new WeakSet<Event>()
  }
  return win.__cowEip6963ReDispatched
}

// Deferred provider announcements that were intercepted while PROVIDER_DISCONNECTED.
// Stored on window so they survive HMR module resets (the listener closure stays alive).
function getDeferredAnnouncements(): CustomEvent[] {
  const win = window as IsolationWindow
  if (!win.__cowEip6963Deferred) {
    win.__cowEip6963Deferred = []
  }
  return win.__cowEip6963Deferred
}

function getProviderIdentifier(info: { name?: string; rdns?: string }): string {
  return info.rdns ?? info.name ?? 'unknown'
}

function isEip6963DispatchDeferred(): boolean {
  return !eip6963ReconnectSettled || activeProviderRef.current === PROVIDER_DISCONNECTED
}

function getDeferReason(): string {
  return !eip6963ReconnectSettled ? 'reconnect pending' : 'PROVIDER_DISCONNECTED'
}

/**
 * Immediately dispatches all EIP-6963 provider announcements that were deferred
 * during page load (PROVIDER_DISCONNECTED state). Call this just before opening
 * the wallet modal so connectors like Brave Wallet appear in the list.
 */
export function flushDeferredProviders(): void {
  if (typeof window === 'undefined') return
  const deferred = getDeferredAnnouncements()
  if (deferred.length === 0) return
  console.log('[providerIsolation] flushDeferredProviders — dispatching', deferred.length, 'deferred providers')
  for (const event of deferred.splice(0)) {
    window.dispatchEvent(event)
  }
}

/**
 * Called by initialReconnectLifecycle once the initial wagmi reconnect() settles.
 * Marks EIP-6963 provider announcements as unblocked, and flushes any announcements
 * that arrived during the reconnect (only when a wallet is active — if no wallet
 * connected, keep them deferred until the user explicitly opens the wallet modal).
 */
export function onReconnectSettled(): void {
  if (eip6963ReconnectSettled) return
  eip6963ReconnectSettled = true
  // If a wallet is active (or initial null state), flush providers that arrived early.
  // If PROVIDER_DISCONNECTED (reconnect found no wallet), keep deferred until modal opens
  // so we don't add Brave Wallet as a connector during the still-active render cascade.
  if (activeProviderRef.current !== PROVIDER_DISCONNECTED) {
    flushDeferredProviders()
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

  console.log('[providerIsolation] interceptEIP6963Providers: capture listener registered')

  // When the wallet modal opens, AppKit dispatches eip6963:requestProvider to rediscover
  // wallets. We respond by flushing any providers that were deferred during page load
  // (when PROVIDER_DISCONNECTED) — at this point the initial render cascade has settled
  // and adding a connector no longer risks an OOM crash.
  window.addEventListener('eip6963:requestProvider', () => {
    const deferred = getDeferredAnnouncements()
    if (deferred.length === 0) return
    console.log('[providerIsolation] eip6963:requestProvider — flushing', deferred.length, 'deferred providers')
    for (const event of deferred.splice(0)) {
      window.dispatchEvent(event)
    }
  })

  window.addEventListener(
    'eip6963:announceProvider',
    (event) => {
      const reDispatched = getReDispatched()
      if (reDispatched.has(event)) return
      event.stopImmediatePropagation()

      const detail = (event as CustomEvent).detail as {
        info: { name?: string; rdns?: string }
        provider: EIP1193Provider
      }

      const rdns = getProviderIdentifier(detail.info)
      console.log('[providerIsolation] intercepted eip6963:announceProvider for', rdns)

      const isolatedProxy = createIsolatedProvider(detail.provider)

      // Register in the rdns registry so config.ts can look up the proxy
      // synchronously without calling connector.getProvider().
      if (detail.info?.rdns) {
        proxyByRdns.set(detail.info.rdns, isolatedProxy)
        console.log('[providerIsolation] registered proxy for rdns:', detail.info.rdns)
      }

      const newEvent = new CustomEvent('eip6963:announceProvider', {
        detail: { info: detail.info, provider: isolatedProxy },
      })
      reDispatched.add(newEvent)

      // Defer dispatch when the initial reconnect hasn't settled yet (Brave Wallet can
      // announce before reconnect() resolves) or when the user has no active wallet.
      // Dispatching during the page-load render cascade causes wagmi to call eth_chainId
      // on the provider, which takes 190ms+ via Brave Wallet's extension IPC, pushing the
      // renderer into OOM when combined with the ongoing React render cascade.
      // Deferred events are flushed by onReconnectSettled() or when the modal opens.
      if (isEip6963DispatchDeferred()) {
        console.log('[providerIsolation] deferring eip6963 dispatch for', rdns, `(${getDeferReason()})`)
        getDeferredAnnouncements().push(newEvent)
      } else {
        console.log('[providerIsolation] dispatching eip6963 event for', rdns)
        window.dispatchEvent(newEvent)
        console.log('[providerIsolation] dispatch complete for', rdns)
      }
    },
    { capture: true },
  )
}
