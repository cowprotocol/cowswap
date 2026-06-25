import { isMobile } from '@cowprotocol/common-utils'

import type { EIP1193Provider } from 'viem'

const GUARD_FLAG = '__mobileInjectedProviderGuarded__'
const GUARD_TIMEOUT_MS = 1000
const GUARDED_METHODS: Partial<Record<string, () => unknown>> = {
  wallet_getCapabilities: () => ({}),
  wallet_revokePermissions: () => null,
}

type ProviderRequestArgs = { method: string; params?: unknown }
type ProviderRequest = (args: ProviderRequestArgs) => Promise<unknown>
type GuardedProvider = Omit<EIP1193Provider, 'request'> & { [GUARD_FLAG]?: true; request: ProviderRequest }

/**
 * MetaMask iOS can leave provider RPCs pending forever. The dangerous cases for
 * us are wallet/account discovery calls used by wagmi/Reown before a signer is
 * available: `eth_accounts`, overlapping `eth_requestAccounts`, and optional
 * capability/permission RPCs. Patch only those calls at the provider boundary so
 * every consumer sees a stable EIP-1193 provider.
 *
 * Do not time out transaction/signing/network-switching methods here. Those
 * legitimately wait while the user reviews a wallet prompt.
 */
export function guardMobileInjectedProvider(provider: EIP1193Provider | undefined): EIP1193Provider | undefined {
  const guardedProvider = provider as GuardedProvider | undefined

  if (!guardedProvider || !isMobile || guardedProvider[GUARD_FLAG]) return provider
  guardedProvider[GUARD_FLAG] = true

  const originalRequest = guardedProvider.request.bind(guardedProvider)
  let inflightRequestAccounts: Promise<unknown> | undefined
  let isConnected = false

  function requestAccounts(): Promise<unknown> {
    // MetaMask rejects or stalls concurrent account prompts. Share one prompt.
    if (!inflightRequestAccounts) {
      inflightRequestAccounts = originalRequest({ method: 'eth_requestAccounts' })
        .then((result) => {
          isConnected = true
          return result
        })
        .finally(() => {
          inflightRequestAccounts = undefined
        })
    }

    return inflightRequestAccounts
  }

  guardedProvider.request = (args: ProviderRequestArgs): Promise<unknown> => {
    if (args.method === 'eth_requestAccounts') return requestAccounts()

    if (args.method === 'eth_accounts') {
      // Before the first account grant, MetaMask iOS may never answer
      // `eth_accounts`; seed it via the user-facing request path instead.
      if (!isConnected) return requestAccounts()

      let timeout: ReturnType<typeof setTimeout> | undefined
      let usedRequestAccountsFallback = false
      const accountsRequest = originalRequest(args)
        .then((result) => {
          // A disconnect can leave the patched provider object alive. Empty
          // accounts means the next reconnect must seed through requestAccounts.
          if (!usedRequestAccountsFallback) {
            isConnected = Array.isArray(result) && result.length > 0
          }
          return result
        })
        .finally(() => {
          if (timeout) clearTimeout(timeout)
        })

      return Promise.race([
        accountsRequest,
        new Promise((resolve) => {
          timeout = setTimeout(() => {
            // Tab restores can leave connected-state eth_accounts pending too.
            // Fall back to the serialized wallet prompt instead of blocking
            // wagmi useWalletClient forever.
            usedRequestAccountsFallback = true
            resolve(requestAccounts())
          }, GUARD_TIMEOUT_MS)
        }),
      ])
    }

    const fallback = GUARDED_METHODS[args.method]
    if (!fallback) return originalRequest(args)

    const request = Promise.race([
      originalRequest(args),
      new Promise((resolve) => {
        setTimeout(() => resolve(fallback()), GUARD_TIMEOUT_MS)
      }),
    ])

    if (args.method === 'wallet_revokePermissions') {
      return request.finally(() => {
        // Reset local guard state after disconnect so Account/Tokens pages do
        // not wait forever on raw eth_accounts during the next reconnect.
        isConnected = false
      })
    }

    return request
  }

  return guardedProvider as EIP1193Provider
}
