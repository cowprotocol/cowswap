import { isMobile } from '@cowprotocol/common-utils'

import type { EIP1193Provider } from 'viem'

/**
 * Some mobile injected providers (notably MetaMask iOS) silently never resolve
 * *nor* reject certain optional capability/permission-discovery RPC methods.
 * Anything that `await`s them hangs forever (e.g. wagmi `connect()`, Reown
 * AppKit balance discovery), which breaks wallet connection on those wallets.
 *
 * This guard races those specific methods against a short timeout and resolves
 * with a safe default when the wallet doesn't answer. Wallets that *do* support
 * the method still get the real response (whichever settles first wins).
 *
 * IMPORTANT: only non-critical *discovery* methods belong here. Transaction and
 * signing methods (`eth_sendTransaction`, `personal_sign`, `eth_requestAccounts`,
 * `wallet_switchEthereumChain`, …) are intentionally excluded — they legitimately
 * take a long time while the user reviews a prompt and must never be timed out.
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

  anyProvider.request = (args: { method: string; params?: unknown }) => {
    const fallback = args?.method ? GUARDED_METHODS[args.method] : undefined
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
