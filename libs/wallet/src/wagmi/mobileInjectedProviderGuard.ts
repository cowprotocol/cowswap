import { isMobile } from '@cowprotocol/common-utils'

import type { EIP1193Provider } from 'viem'

/**
 * Works around quirks of mobile injected providers (notably MetaMask iOS) that
 * otherwise break wallet connection. All logic lives at the provider boundary so
 * every consumer (wagmi connector, Reown AppKit, viem transport) benefits.
 *
 * Three problems are handled:
 *
 * 1. `eth_requestAccounts` is serialized by MetaMask — issuing it again while one
 *    is in flight fails with "Already processing eth_requestAccounts. Please
 *    wait." or hangs. When the user connects via the Reown modal, wagmi/AppKit
 *    fire many overlapping account/connection requests and collide. We share a
 *    single in-flight `eth_requestAccounts` promise so concurrent callers await
 *    the same prompt instead of racing.
 *
 * 2. Before a connection exists, MetaMask iOS never resolves *nor* rejects
 *    `eth_accounts` — it just hangs. We route `eth_accounts` through the shared
 *    `eth_requestAccounts` seed until connected; afterwards `eth_accounts` works
 *    and is parallel-safe, so we use it directly (it must NOT be serialized).
 *
 * 3. Optional capability/permission discovery methods (`wallet_getCapabilities`,
 *    `wallet_revokePermissions`) also hang on MetaMask iOS. We race them against a
 *    short timeout and resolve with a safe default.
 *
 * IMPORTANT: transaction/signing methods (`eth_sendTransaction`, `personal_sign`,
 * `wallet_switchEthereumChain`, …) are never timed out — they legitimately take a
 * long time while the user reviews a prompt.
 */
const GUARD_FLAG = '__mobileInjectedGuard__'
const GUARD_TIMEOUT_MS = 1000

// method -> value returned when the wallet doesn't answer within the timeout
const GUARDED_METHODS: Record<string, () => unknown> = {
  // ERC-5792 capability discovery (Reown AppKit asset discovery). Empty object
  // = "no capabilities", so callers fall back to the default balance path.
  wallet_getCapabilities: () => ({}),
  // MIP-2 permission revoke, fired on disconnect. No-op so disconnect completes.
  wallet_revokePermissions: () => null,
}

export function guardMobileInjectedProvider(provider: EIP1193Provider | undefined): EIP1193Provider | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyProvider = provider as any
  if (!provider || !isMobile || anyProvider[GUARD_FLAG]) return provider
  anyProvider[GUARD_FLAG] = true

  const originalRequest = provider.request.bind(provider) as (args: {
    method: string
    params?: unknown
  }) => Promise<unknown>

  // Shared in-flight `eth_requestAccounts` (problem 1).
  let inflightRequestAccounts: Promise<unknown> | null = null
  // Whether a connection has been established (problem 2).
  let isConnected = false

  function requestAccounts(): Promise<unknown> {
    if (inflightRequestAccounts) return inflightRequestAccounts
    inflightRequestAccounts = originalRequest({ method: 'eth_requestAccounts' })
      .then((res) => {
        isConnected = true
        return res
      })
      .finally(() => {
        inflightRequestAccounts = null
      })
    return inflightRequestAccounts
  }

  anyProvider.request = (args: { method: string; params?: unknown }) => {
    const method = args?.method

    // Problem 1: collapse concurrent connection requests into one.
    if (method === 'eth_requestAccounts') return requestAccounts()

    // Problem 2: avoid the pre-connection `eth_accounts` hang.
    if (method === 'eth_accounts') {
      if (!isConnected) return requestAccounts()
      return originalRequest(args).then((res) => {
        if (Array.isArray(res) && res.length > 0) isConnected = true
        return res
      })
    }

    // Problem 3: time-box optional discovery methods.
    const fallback = method ? GUARDED_METHODS[method] : undefined
    const request = originalRequest(args)
    if (!fallback) return request

    return Promise.race([
      request,
      new Promise((resolve) => {
        setTimeout(() => resolve(fallback()), GUARD_TIMEOUT_MS)
      }),
    ])
  }

  return provider
}
