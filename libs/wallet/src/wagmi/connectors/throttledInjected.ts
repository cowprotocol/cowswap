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

      return { ...provider, request } as typeof provider
    }

    return base
  })
}
