/**
 * Deduplicates eth_sendTransaction so only one request reaches the wallet and
 * only one "transaction complete" page opens. Patches window.ethereum (and
 * each provider in window.ethereum.providers) in place so every .request()
 * is intercepted regardless of which code path holds the reference.
 */
const COALESCE_MS = 3000

let inFlight: Promise<unknown> | null = null
let inFlightStartedAt = 0

type RequestFn = (args: { method: string; params?: unknown }) => Promise<unknown>

function wrapRequest(originalRequest: RequestFn): RequestFn {
  return (args: { method: string; params?: unknown }) => {
    if (args.method !== 'eth_sendTransaction') {
      return originalRequest(args)
    }

    const now = Date.now()
    if (inFlight !== null && now - inFlightStartedAt < COALESCE_MS) {
      return inFlight
    }

    const promise = originalRequest(args).then(
      (result) => result,
      (err) => {
        inFlight = null
        throw err
      },
    )
    inFlight = promise
    inFlightStartedAt = now
    promise.finally(() => {
      setTimeout(() => {
        inFlight = null
      }, COALESCE_MS)
    })
    return promise
  }
}

type EthereumLike = {
  request: RequestFn
  providers?: EthereumLike[]
  [key: string]: unknown
}

function patchProvider(provider: EthereumLike): boolean {
  if (typeof provider?.request !== 'function') return false
  const original = provider.request.bind(provider)
  const wrapped = wrapRequest(original)
  try {
    Object.defineProperty(provider, 'request', {
      value: wrapped,
      writable: true,
      configurable: true,
    })
    return true
  } catch {
    try {
      ;(provider as { request: RequestFn }).request = wrapped
      return true
    } catch {
      return false
    }
  }
}

function install(): boolean {
  const w = typeof window !== 'undefined' ? window : null
  if (!w?.ethereum || typeof (w.ethereum as EthereumLike).request !== 'function') return false
  const ethereum = w.ethereum as EthereumLike
  const patched = patchProvider(ethereum)
  if (patched && Array.isArray(ethereum.providers)) {
    ethereum.providers.forEach((p: EthereumLike) => patchProvider(p))
  }
  return patched
}

/** EIP-6963: patch providers when they are announced so we intercept even when Reown uses them. */
function listenEip6963(): void {
  if (typeof window === 'undefined') return
  const handler = (event: Event): void => {
    const detail = (event as CustomEvent<{ provider: EthereumLike }>).detail
    if (detail?.provider) patchProvider(detail.provider)
  }
  window.addEventListener('eip6963:announceProvider', handler)
  // Ask providers to announce themselves (they fire eip6963:announceProvider).
  window.dispatchEvent(new Event('eip6963:requestProvider'))
}

/**
 * Call at app init. Patches window.ethereum (and EIP-6963 announced providers) so
 * eth_sendTransaction is deduplicated and only one "transaction complete" page opens.
 */
export function deduplicateEthereumSendTransaction(): void {
  install()
  listenEip6963()
  // Retry patching window.ethereum for late-injected extensions (e.g. MetaMask).
  const retries = [100, 500, 1500, 3000]
  retries.forEach((delay) => {
    setTimeout(() => install(), delay)
  })
}
