import type { EIP1193Provider } from '@cowprotocol/types'
import type { Actions } from '@web3-react/types'

import EventEmitter from 'eventemitter3'

import { InjectedWallet } from './index'

type TestProvider = EIP1193Provider & {
  chainId?: unknown
  networkVersion?: unknown
  provider?: { chainId?: unknown }
  _state?: { chainId?: unknown; network?: { chainId?: unknown } }
  session?: { chainId?: unknown }
}

const createActions = (): Actions => ({
  startActivation: jest.fn(() => jest.fn()),
  update: jest.fn(),
  resetState: jest.fn(),
})

const createProvider = (requestMock: jest.Mock, metadata: Partial<TestProvider> = {}): TestProvider =>
  Object.assign(new EventEmitter(), { request: requestMock }, metadata) as TestProvider

const createWallet = (provider: EIP1193Provider): InjectedWallet => {
  const wallet = new InjectedWallet({
    actions: createActions(),
    onError: jest.fn(),
    walletUrl: 'https://example.com',
    searchKeywords: [],
  })

  wallet.provider = provider

  return wallet
}

const getChainIdWithRetry = (wallet: InjectedWallet, maxRetries?: number): Promise<string | number> =>
  (wallet as unknown as { getChainIdWithRetry(maxRetries?: number): Promise<string | number> }).getChainIdWithRetry(
    maxRetries,
  )

describe('getChainIdWithRetry', () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.useRealTimers()
  })

  it('prefers eth_chainId over cached provider metadata', async () => {
    const provider = createProvider(jest.fn().mockResolvedValue('0x2a'), { chainId: '0x1' })
    const wallet = createWallet(provider)

    const chainId = await getChainIdWithRetry(wallet, 1)

    expect(chainId).toBe('0x2a')
    expect(provider.request).toHaveBeenCalledTimes(1)
    expect(provider.request).toHaveBeenCalledWith({ method: 'eth_chainId' })
  })

  it('falls back to provider metadata when eth_chainId fails', async () => {
    const provider = createProvider(jest.fn().mockRejectedValue(new Error('boom')), { chainId: '0x64' })
    const wallet = createWallet(provider)

    const chainId = await getChainIdWithRetry(wallet, 2)

    expect(chainId).toBe('0x64')
    expect(provider.request).toHaveBeenCalledTimes(1)
  })

  it('retries on empty array responses before succeeding', async () => {
    jest.useFakeTimers()

    const provider = createProvider(jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce('0x7a69'))
    const wallet = createWallet(provider)

    const chainIdPromise = getChainIdWithRetry(wallet, 2)

    await jest.runAllTimersAsync()
    const chainId = await chainIdPromise

    expect(chainId).toBe('0x7a69')
    expect(provider.request).toHaveBeenCalledTimes(2)
  })

  it('uses metadata immediately when RPC returns empty array', async () => {
    const provider = createProvider(jest.fn().mockResolvedValue([]), { chainId: '0x64' })
    const wallet = createWallet(provider)

    const chainId = await getChainIdWithRetry(wallet, 3)

    expect(chainId).toBe('0x64')
    expect(provider.request).toHaveBeenCalledTimes(1)
  })
})
