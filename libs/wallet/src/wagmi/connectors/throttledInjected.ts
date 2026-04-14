import { injected } from '@wagmi/connectors'
import { createConnector } from '@wagmi/core'

const CONNECT_DEDUPE_MS = 2500
const SEND_TX_DEDUPE_MS = 4000
const SEND_TX_COALESCE_MS = 800

let inFlightPromise: Promise<unknown> | null = null
let inFlightConnectorId: string | null = null

let sendTxInFlight: { key: string; promise: Promise<unknown>; startedAt: number } | null = null

function sendTransactionKey(params: unknown): string {
  if (!Array.isArray(params) || !params[0] || typeof params[0] !== 'object') return ''
  const tx = params[0] as Record<string, unknown>
  return `${tx.to ?? ''}:${tx.value ?? ''}:${tx.data ?? ''}`
}

/**
 * Wraps wagmi's `injected()` connector with deduplication guards to prevent
 * duplicate wallet popups caused by rapid or concurrent calls.
 *
 * Two layers of protection:
 *
 * 1. **connect() deduplication** — If `connect()` is called while a previous
 *    connection attempt for the same connector is still in flight, the existing
 *    promise is returned instead of triggering a second wallet prompt. After a
 *    successful connection, a cooldown window (CONNECT_DEDUPE_MS) prevents
 *    immediate re-triggers.
 *
 * 2. **eth_sendTransaction deduplication** — Intercepts the provider's `request()`
 *    method to coalesce duplicate `eth_sendTransaction` calls. Two requests are
 *    considered duplicates if they share the same (to, value, data) key OR arrive
 *    within a short coalesce window (SEND_TX_COALESCE_MS) of each other. After a
 *    transaction settles, a longer cooldown (SEND_TX_DEDUPE_MS) blocks identical
 *    replays. Non-transaction RPC calls pass through untouched.
 *
 * This is necessary because React strict-mode double-renders, wagmi reconnect
 * logic, and rapid user clicks can all cause the same wallet action to fire
 * multiple times, leading to confusing duplicate popups in MetaMask and similar
 * injected wallets.
 */
export function throttledInjected(): ReturnType<typeof createConnector> {
  const injectedFn = injected()
  return createConnector((config) => {
    const base = injectedFn(config)
    const originalConnect = base.connect.bind(base)
    base.connect = (async (params) => {
      const connectorId = base.id ?? 'injected'
      if (inFlightPromise !== null && inFlightConnectorId === connectorId) {
        return inFlightPromise as unknown as ReturnType<typeof originalConnect>
      }
      inFlightConnectorId = connectorId
      inFlightPromise = originalConnect(params)
      try {
        const result = (await inFlightPromise) as Awaited<ReturnType<typeof originalConnect>>
        setTimeout(() => {
          if (inFlightConnectorId === connectorId) {
            inFlightPromise = null
            inFlightConnectorId = null
          }
        }, CONNECT_DEDUPE_MS)
        return result
      } catch (err: unknown) {
        if (inFlightConnectorId === connectorId) {
          inFlightPromise = null
          inFlightConnectorId = null
        }
        throw err
      }
    }) as typeof base.connect

    const originalGetProvider = base.getProvider.bind(base)
    base.getProvider = async () => {
      const provider = await originalGetProvider()
      if (!provider || typeof provider.request !== 'function') return provider

      const originalRequest = provider.request.bind(provider)
      const request = (args: { method: string; params?: unknown }): ReturnType<typeof provider.request> => {
        if (args.method !== 'eth_sendTransaction') {
          return originalRequest(args as Parameters<typeof provider.request>[0])
        }
        const key = sendTransactionKey(args.params)
        if (!key) return originalRequest(args as Parameters<typeof provider.request>[0])

        const now = Date.now()
        if (sendTxInFlight !== null) {
          const sameKey = sendTxInFlight.key === key
          const withinCoalesceWindow = now - sendTxInFlight.startedAt < SEND_TX_COALESCE_MS
          if (sameKey || withinCoalesceWindow) {
            return sendTxInFlight.promise as ReturnType<typeof provider.request>
          }
        }

        const promise = originalRequest(args as Parameters<typeof provider.request>[0])
          .then((result) => result)
          .catch((err: unknown) => {
            if (sendTxInFlight?.key === key) {
              sendTxInFlight = null
            }
            throw err
          })
        sendTxInFlight = { key, promise, startedAt: now }
        promise.finally(() => {
          const current = key
          setTimeout(() => {
            if (sendTxInFlight?.key === current) {
              sendTxInFlight = null
            }
          }, SEND_TX_DEDUPE_MS)
        })
        return promise as ReturnType<typeof provider.request>
      }

      // Use Object.create to preserve the prototype chain — spreading loses prototype
      // methods (on, emit, removeListener) which wagmi requires to register EIP-1193
      // event listeners. This matters for class-based providers like the e2e mock.
      const wrapped = Object.create(provider)
      wrapped.request = request
      return wrapped
    }

    return base
  })
}
