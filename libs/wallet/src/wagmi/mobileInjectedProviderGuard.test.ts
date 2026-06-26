import { guardMobileInjectedProvider } from './mobileInjectedProviderGuard'

import type { EIP1193Provider } from 'viem'

let mockIsMobile = true

jest.mock('@cowprotocol/common-utils', () => ({
  get isMobile() {
    return mockIsMobile
  },
}))

function createProvider(request: EIP1193Provider['request'], chainId?: string): EIP1193Provider {
  return { request, chainId } as EIP1193Provider
}

describe('guardMobileInjectedProvider', () => {
  beforeEach(() => {
    mockIsMobile = true
    jest.useRealTimers()
  })

  it('does not patch non-mobile providers', async () => {
    mockIsMobile = false
    const request = jest.fn<EIP1193Provider['request']>().mockResolvedValue(['0x1'])
    const provider = createProvider(request)

    const guardedProvider = guardMobileInjectedProvider(provider)

    await guardedProvider?.request({ method: 'eth_accounts' })
    expect(request).toHaveBeenCalledWith({ method: 'eth_accounts' })
  })

  it('shares concurrent request account calls', async () => {
    let resolveRequest: (value: readonly string[]) => void = () => void 0
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve
        }),
    )
    const provider = guardMobileInjectedProvider(createProvider(request))

    const first = provider?.request({ method: 'eth_requestAccounts' })
    const second = provider?.request({ method: 'eth_requestAccounts' })

    expect(request).toHaveBeenCalledTimes(1)
    resolveRequest(['0x1'])
    await expect(Promise.all([first, second])).resolves.toEqual([['0x1'], ['0x1']])
  })

  it('seeds pre-connection eth_accounts through request accounts', async () => {
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(({ method }) => {
      if (method === 'eth_requestAccounts') return Promise.resolve(['0x1'])
      if (method === 'eth_accounts') return Promise.resolve(['0x2'])

      return Promise.resolve(null)
    })
    const provider = guardMobileInjectedProvider(createProvider(request))

    await expect(provider?.request({ method: 'eth_accounts' })).resolves.toEqual(['0x1'])
    await expect(provider?.request({ method: 'eth_accounts' })).resolves.toEqual(['0x2'])
  })

  it('resets connection state after disconnect so reconnect seeds accounts again', async () => {
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(({ method }) => {
      if (method === 'eth_requestAccounts') return Promise.resolve(['0x1'])
      if (method === 'eth_accounts') return Promise.resolve([])
      if (method === 'wallet_revokePermissions') return Promise.resolve(null)

      return Promise.resolve(null)
    })
    const provider = guardMobileInjectedProvider(createProvider(request))

    await expect(provider?.request({ method: 'eth_requestAccounts' })).resolves.toEqual(['0x1'])
    await expect(provider?.request({ method: 'wallet_revokePermissions' })).resolves.toBeNull()
    await expect(provider?.request({ method: 'eth_accounts' })).resolves.toEqual(['0x1'])

    expect(request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' })
    expect(request).toHaveBeenNthCalledWith(2, { method: 'wallet_revokePermissions' })
    expect(request).toHaveBeenNthCalledWith(3, { method: 'eth_requestAccounts' })
  })

  it('falls back from a connected eth_accounts hang to request accounts', async () => {
    jest.useFakeTimers()
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(({ method }) => {
      if (method === 'eth_requestAccounts') return Promise.resolve(['0x1'])
      if (method === 'eth_accounts') return new Promise(() => void 0)

      return Promise.resolve(null)
    })
    const provider = guardMobileInjectedProvider(createProvider(request))

    await expect(provider?.request({ method: 'eth_requestAccounts' })).resolves.toEqual(['0x1'])
    const accounts = provider?.request({ method: 'eth_accounts' })
    jest.advanceTimersByTime(1000)

    await expect(accounts).resolves.toEqual(['0x1'])
    expect(request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' })
    expect(request).toHaveBeenNthCalledWith(2, { method: 'eth_accounts' })
    expect(request).toHaveBeenNthCalledWith(3, { method: 'eth_requestAccounts' })
  })

  it('does not request accounts after fast connected eth_accounts calls', async () => {
    jest.useFakeTimers()
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(({ method }) => {
      if (method === 'eth_requestAccounts') return Promise.resolve(['0x1'])
      if (method === 'eth_accounts') return Promise.resolve(['0x1'])

      return Promise.resolve(null)
    })
    const provider = guardMobileInjectedProvider(createProvider(request))

    await expect(provider?.request({ method: 'eth_requestAccounts' })).resolves.toEqual(['0x1'])
    await expect(provider?.request({ method: 'eth_accounts' })).resolves.toEqual(['0x1'])
    jest.advanceTimersByTime(1000)

    expect(request).toHaveBeenCalledTimes(2)
    expect(request).toHaveBeenNthCalledWith(1, { method: 'eth_requestAccounts' })
    expect(request).toHaveBeenNthCalledWith(2, { method: 'eth_accounts' })
  })

  it('falls back from an eth_chainId hang to the provider chain id', async () => {
    jest.useFakeTimers()
    const request = jest.fn<EIP1193Provider['request']>().mockReturnValue(new Promise(() => void 0))
    const provider = guardMobileInjectedProvider(createProvider(request, '0x64'))
    const chainId = provider?.request({ method: 'eth_chainId' })

    jest.advanceTimersByTime(1000)

    await expect(chainId).resolves.toBe('0x64')
  })

  it('does not use the provider chain id when eth_chainId returns normally', async () => {
    jest.useFakeTimers()
    const request = jest.fn<EIP1193Provider['request']>().mockImplementation(({ method }) => {
      if (method === 'eth_chainId') return Promise.resolve('0x1')

      return Promise.resolve(null)
    })
    const provider = guardMobileInjectedProvider(createProvider(request, '0x64'))

    await expect(provider?.request({ method: 'eth_chainId' })).resolves.toBe('0x1')
    jest.advanceTimersByTime(1000)

    expect(request).toHaveBeenCalledTimes(1)
  })

  it('times out optional discovery calls with safe defaults', async () => {
    jest.useFakeTimers()
    const request = jest.fn<EIP1193Provider['request']>().mockReturnValue(new Promise(() => void 0))
    const provider = guardMobileInjectedProvider(createProvider(request))
    const capabilities = provider?.request({ method: 'wallet_getCapabilities' })

    jest.advanceTimersByTime(1000)

    await expect(capabilities).resolves.toEqual({})
  })
})
