import type { EIP1193Provider } from 'viem'

jest.mock('./wagmi/mobileInjectedProviderGuard', () => ({
  guardMobileInjectedProvider: jest.fn((provider: EIP1193Provider | undefined) => provider),
  resetMobileInjectedProviderGuard: jest.fn(),
}))

type ProviderIsolationModule = typeof import('./providerIsolation')

type IsolationTestWindow = Window &
  typeof globalThis & {
    __cowEip6963InterceptRegistered?: boolean
    __cowEip6963ReDispatched?: WeakSet<Event>
    __cowEip6963DeferredBraveWallet?: unknown[]
    __cowEip6963AnnounceProviderListener?: EventListener
  }

const provider: EIP1193Provider = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
}

function resetWindowState(): void {
  const win = window as IsolationTestWindow
  if (win.__cowEip6963AnnounceProviderListener) {
    window.removeEventListener('eip6963:announceProvider', win.__cowEip6963AnnounceProviderListener, {
      capture: true,
    })
  }
  delete win.__cowEip6963InterceptRegistered
  delete win.__cowEip6963ReDispatched
  delete win.__cowEip6963DeferredBraveWallet
  delete win.__cowEip6963AnnounceProviderListener
}

async function loadProviderIsolation(): Promise<ProviderIsolationModule> {
  jest.resetModules()
  return import('./providerIsolation')
}

describe('interceptEIP6963Providers', () => {
  beforeEach(() => {
    resetWindowState()
  })

  it('does not read Brave Wallet provider until deferred announcements are flushed', async () => {
    const { flushDeferredProviders, interceptEIP6963Providers } = await loadProviderIsolation()
    const downstreamListener = jest.fn()
    let providerReadCount = 0
    const detail: { info: { name: string; rdns: string }; provider: EIP1193Provider } = {
      info: { name: 'Brave Wallet', rdns: 'com.brave.wallet' },
      get provider() {
        providerReadCount += 1
        return provider
      },
    }

    interceptEIP6963Providers()
    window.addEventListener('eip6963:announceProvider', downstreamListener, { capture: true })

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        bubbles: true,
        detail,
      }),
    )

    expect(providerReadCount).toBe(0)
    expect(downstreamListener).not.toHaveBeenCalled()

    flushDeferredProviders()

    expect(providerReadCount).toBe(1)
    expect(downstreamListener).toHaveBeenCalledTimes(1)
  })

  it('continues to wrap non-Brave providers immediately', async () => {
    const { interceptEIP6963Providers } = await loadProviderIsolation()
    const { guardMobileInjectedProvider } = await import('./wagmi/mobileInjectedProviderGuard')
    const downstreamListener = jest.fn()
    let providerReadCount = 0
    const detail: { info: { name: string; rdns: string }; provider: EIP1193Provider } = {
      info: { name: 'MetaMask', rdns: 'io.metamask' },
      get provider() {
        providerReadCount += 1
        return provider
      },
    }

    interceptEIP6963Providers()
    window.addEventListener('eip6963:announceProvider', downstreamListener, { capture: true })

    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        bubbles: true,
        detail,
      }),
    )

    expect(providerReadCount).toBe(1)
    expect(guardMobileInjectedProvider).toHaveBeenCalledWith(provider)
    expect(downstreamListener).toHaveBeenCalledTimes(1)
    expect((downstreamListener.mock.calls[0]?.[0] as CustomEvent).detail.provider).not.toBe(provider)
  })
})

describe('createIsolatedProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resets the mobile provider guard when blocking wallet_revokePermissions', async () => {
    const { createIsolatedProvider } = await loadProviderIsolation()
    const { resetMobileInjectedProviderGuard } = await import('./wagmi/mobileInjectedProviderGuard')
    const request = jest.fn<EIP1193Provider['request']>().mockResolvedValue(null)
    const original = {
      request,
      on: jest.fn(),
      removeListener: jest.fn(),
    } as EIP1193Provider
    const isolatedProvider = createIsolatedProvider(original)

    await expect(isolatedProvider.request({ method: 'wallet_revokePermissions' })).resolves.toBeNull()

    expect(resetMobileInjectedProviderGuard).toHaveBeenCalledWith(original)
    expect(request).not.toHaveBeenCalled()
  })
})
