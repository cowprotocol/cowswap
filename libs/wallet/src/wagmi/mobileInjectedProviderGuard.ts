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

export function guardMobileInjectedProvider(provider: EIP1193Provider | undefined): EIP1193Provider | undefined {
  const guardedProvider = provider as GuardedProvider | undefined

  if (!guardedProvider || !isMobile || guardedProvider[GUARD_FLAG]) return provider
  guardedProvider[GUARD_FLAG] = true

  const originalRequest = guardedProvider.request.bind(guardedProvider)
  let inflightRequestAccounts: Promise<unknown> | undefined
  let isConnected = false

  function requestAccounts(): Promise<unknown> {
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

    if (args.method === 'eth_accounts' && !isConnected) return requestAccounts()

    const fallback = GUARDED_METHODS[args.method]
    if (!fallback) return originalRequest(args)

    return Promise.race([
      originalRequest(args),
      new Promise((resolve) => {
        setTimeout(() => resolve(fallback()), GUARD_TIMEOUT_MS)
      }),
    ])
  }

  return guardedProvider as EIP1193Provider
}
