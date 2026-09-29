export interface InjectedShimConfig {
  address: string
  chainIdHex: string
  uuid: string
  name: string
  rdns: string
  icon: string
}

export const E2E_WALLET_INFO: Omit<InjectedShimConfig, 'address' | 'chainIdHex'> = {
  uuid: 'e2e00000-0000-4000-8000-000000000001',
  name: 'E2E Wallet',
  rdns: 'fi.cow.e2e-wallet',
  icon:
    'data:image/svg+xml;base64,' +
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" rx="6" fill="#052b65"/><text x="16" y="21" font-size="14" text-anchor="middle" fill="#fff">E2E</text></svg>',
    ).toString('base64'),
}

interface RpcEnvelopeLike {
  ok: boolean
  result?: unknown
  error?: { code: number; message: string; data?: unknown }
}

/**
 * Installed via `context.addInitScript(injectedShim, cfg)` — the function is
 * SERIALIZED into the page, so it must not reference any imports or captured
 * identifiers. Everything it needs comes through `cfg` or globals.
 */
export function injectedShim(cfg: InjectedShimConfig): void {
  const listeners = new Map<string, Set<(payload: unknown) => void>>()

  interface Eip1193RequestArgs {
    method: string
    params?: unknown[]
  }

  async function request({ method, params = [] }: Eip1193RequestArgs): Promise<unknown> {
    const bridge = (window as never as { __e2eWalletRequest(req: Eip1193RequestArgs): Promise<RpcEnvelopeLike> })
      .__e2eWalletRequest
    const envelope = await bridge({ method, params })
    if (envelope.ok) return envelope.result
    const error = new Error(envelope.error?.message ?? 'RPC error') as Error & { code: number; data?: unknown }
    error.code = envelope.error?.code ?? -32000
    error.data = envelope.error?.data
    throw error
  }

  const provider = {
    isE2EWallet: true,
    selectedAddress: cfg.address,
    chainId: cfg.chainIdHex,
    request,
    on(event: string, cb: (payload: unknown) => void) {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)?.add(cb)
      return provider
    },
    removeListener(event: string, cb: (payload: unknown) => void) {
      listeners.get(event)?.delete(cb)
      return provider
    },
    removeAllListeners(event?: string) {
      if (event) listeners.delete(event)
      else listeners.clear()
      return provider
    },
    // Legacy Web3 1.x forms: send({method, params}, cb) and send(method, params?)
    send(
      methodOrRequest: string | Eip1193RequestArgs,
      paramsOrCallback?: unknown[] | ((error: Error | null, result: { result: unknown } | null) => void),
    ): Promise<unknown> | void {
      if (typeof methodOrRequest === 'object' && typeof paramsOrCallback === 'function') {
        const callback = paramsOrCallback
        request(methodOrRequest).then(
          (result) => callback(null, { result }),
          (error: Error) => callback(error, null),
        )
        return
      }
      return request({ method: methodOrRequest as string, params: paramsOrCallback as unknown[] | undefined })
    },
  }

  ;(window as never as { __e2eWalletEmit(event: string, payload: unknown): void }).__e2eWalletEmit = (
    event,
    payload,
  ) => {
    if (event === 'chainChanged') provider.chainId = payload as string
    listeners.get(event)?.forEach((cb) => cb(payload))
  }
  ;(window as never as { ethereum: unknown }).ethereum = provider

  const detail = Object.freeze({
    info: { uuid: cfg.uuid, name: cfg.name, icon: cfg.icon, rdns: cfg.rdns },
    provider,
  })
  const announce = (): void => {
    window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail }))
  }
  window.addEventListener('eip6963:requestProvider', announce)
  announce()
}
