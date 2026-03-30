import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'

import {
  getShouldCheckCapabilities,
  isBundlingSupportedAtom,
  isBundlingSupportedAsyncAtom,
  isBundlingSupportedLoadableAtom,
  walletCapabilitiesAtom,
  walletCapabilitiesLoadableAtom,
} from './walletCapabilitiesAtom'

import { gnosisSafeInfoAtom, walletInfoAtom } from '../state'

import type { WalletCapabilities } from './walletCapabilitiesAtom'
import type { WalletInfo } from '../types'

const MOCK_ACCOUNT = '0x1234567890123456789012345678901234567890' as const
const MOCK_CHAIN_ID = SupportedChainId.MAINNET

const mockGetRpcProvider = jest.fn()
const mockIsMobile = jest.fn()
const mockGetIsWalletConnectLegacy = jest.fn()
const mockGetIsWalletConnect = jest.fn()
const mockGetCapabilities = jest.fn()
const mockConfigGetClient = jest.fn()

jest.mock('@cowprotocol/common-const', () => ({
  ...jest.requireActual('@cowprotocol/common-const'),
  getRpcProvider: (...args: unknown[]) => mockGetRpcProvider(...args),
  get LAUNCH_DARKLY_VIEM_MIGRATION(): boolean {
    return (globalThis as unknown as { __LD_VIEM_MIGRATION?: boolean }).__LD_VIEM_MIGRATION ?? false
  },
}))

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isMobile: () => mockIsMobile(),
}))

jest.mock('../../wagmi/hooks/useIsWalletConnect', () => ({
  getIsWalletConnect: (...args: unknown[]) => mockGetIsWalletConnect(...args),
}))

jest.mock('../../web3-react/hooks/useIsWalletConnect', () => ({
  getIsWalletConnect: (...args: unknown[]) => mockGetIsWalletConnectLegacy(...args),
}))

jest.mock('../../web3-react/hooks/useWalletMetadata', () => {
  const { atom } = require('jotai')
  return {
    ...jest.requireActual('../../web3-react/hooks/useWalletMetadata'),
    isSafeAppAtom: atom(false),
    isSafeViaWcAtom: atom(false),
  }
})

jest.mock('viem/actions', () => ({
  getCapabilities: (...args: unknown[]) => mockGetCapabilities(...args),
}))

jest.mock('../../wagmi/config', () => ({
  config: {
    getClient: (...args: unknown[]) => mockConfigGetClient(...args),
  },
}))

function setViemMigration(enabled: boolean): void {
  ;(globalThis as unknown as { __LD_VIEM_MIGRATION?: boolean }).__LD_VIEM_MIGRATION = enabled
}

function createMockProvider(sendImpl: () => Promise<unknown>): { send: jest.Mock } {
  return { send: jest.fn().mockImplementation(sendImpl) }
}

function setWalletInfo(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    account: string
    chainId: SupportedChainId
    provider: { send: jest.Mock }
    legacyConnector: unknown
    connector: unknown
  }>,
): void {
  const provider = overrides.provider ?? createMockProvider(() => Promise.resolve(null))
  store.set(walletInfoAtom, {
    chainId: overrides.chainId ?? MOCK_CHAIN_ID,
    account: overrides.account ?? MOCK_ACCOUNT,
    provider: provider as unknown as WalletInfo['provider'],
    legacyConnector: (overrides.legacyConnector ?? {}) as WalletInfo['legacyConnector'],
    connector: (overrides.connector ?? {}) as WalletInfo['connector'],
  })
}

describe('walletCapabilitiesAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnectLegacy.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetRpcProvider.mockReturnValue({})
    setViemMigration(false)
  })

  describe('getShouldCheckCapabilities (widget meta info)', () => {
    it('resolves when WidgetEthereumProvider never sends meta (timeout)', async () => {
      jest.useFakeTimers()
      const provider = new WidgetEthereumProvider({ eventSource: window, eventTarget: window })
      mockGetRpcProvider.mockReturnValue(provider)

      const promise = getShouldCheckCapabilities(false, MOCK_CHAIN_ID)
      await jest.advanceTimersByTimeAsync(10_000)
      const result = await promise

      expect(result).toBe(true)
      jest.useRealTimers()
    })
  })

  describe('walletInfoAtom state: missing account/chain/provider', () => {
    it('returns undefined when account is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        provider: createMockProvider(() => Promise.resolve(null)) as unknown as WalletInfo['provider'],
        legacyConnector: {} as WalletInfo['legacyConnector'],
        connector: {} as WalletInfo['connector'],
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })

    it('returns undefined when chainId is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        account: MOCK_ACCOUNT,
        provider: createMockProvider(() => Promise.resolve(null)) as unknown as WalletInfo['provider'],
        legacyConnector: {} as WalletInfo['legacyConnector'],
        connector: {} as WalletInfo['connector'],
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })

    it('returns undefined when provider is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
        legacyConnector: {} as WalletInfo['legacyConnector'],
        connector: {} as WalletInfo['connector'],
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })

    it('returns undefined when legacyConnector is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
        provider: createMockProvider(() => Promise.resolve(null)) as unknown as WalletInfo['provider'],
        connector: {} as WalletInfo['connector'],
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })

    it('returns undefined when connector is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
        provider: createMockProvider(() => Promise.resolve(null)) as unknown as WalletInfo['provider'],
        legacyConnector: {} as WalletInfo['legacyConnector'],
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })
  })

  describe('legacy path: provider.send(wallet_getCapabilities)', () => {
    it('returns capabilities when provider.send resolves with chainId key', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
      const store = createStore()
      const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
      setWalletInfo(store, { provider })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(provider.send).toHaveBeenCalledWith('wallet_getCapabilities', [MOCK_ACCOUNT])
    })

    it('returns fallback capability when provider returns single key (Safe fallback)', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'ready' } }
      const store = createStore()
      const provider = createMockProvider(() => Promise.resolve({ '0x64': capabilities }))
      setWalletInfo(store, { provider })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('returns undefined when provider.send resolves with null/empty', async () => {
      const store = createStore()
      const provider = createMockProvider(() => Promise.resolve(null))
      setWalletInfo(store, { provider })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeUndefined()
    })

    it('returns undefined on provider timeout', async () => {
      jest.useFakeTimers()
      const store = createStore()
      const provider = createMockProvider(() => new Promise(() => {}))
      setWalletInfo(store, { provider })

      const resultPromise = store.get(walletCapabilitiesAtom)
      await jest.advanceTimersByTimeAsync(15_000)
      const result = await resultPromise

      expect(result).toBeUndefined()
      jest.useRealTimers()
    })

    it('returns undefined on provider.send error; loadable has data undefined not hasError', async () => {
      const store = createStore()
      const provider = createMockProvider(() => Promise.reject(new Error('RPC error')))
      setWalletInfo(store, { provider })

      store.get(walletCapabilitiesLoadableAtom)
      const result = await store.get(walletCapabilitiesAtom)
      expect(result).toBeUndefined()

      const loadable = store.get(walletCapabilitiesLoadableAtom)
      expect(loadable.state).toBe('hasData')
      if (loadable.state === 'hasData') {
        expect(loadable.data).toBeUndefined()
      }
      expect('error' in loadable ? loadable.error : null).toBeFalsy()
    })
  })

  describe('viem path: LAUNCH_DARKLY_VIEM_MIGRATION true', () => {
    beforeEach(() => setViemMigration(true))

    it('returns capabilities from getCapabilities when config.getClient is mocked', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue(capabilities)
      mockConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalled()
      expect(mockConfigGetClient).toHaveBeenCalledWith({ chainId: MOCK_CHAIN_ID })
    })

    it('returns undefined when getCapabilities throws', async () => {
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      mockConfigGetClient.mockReturnValue({})

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom).catch(() => undefined)

      expect(result).toBeUndefined()
    })
  })

  describe('loadable atom', () => {
    it('exposes loading then data when provider resolves', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
      const store = createStore()
      const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
      setWalletInfo(store, { provider })

      const loadable = store.get(walletCapabilitiesLoadableAtom)

      expect(loadable.state).toBe('loading')
      const data = await store.get(walletCapabilitiesAtom)
      expect(data).toEqual(capabilities)
      const loadableAfter = store.get(walletCapabilitiesLoadableAtom)
      expect(loadableAfter.state).toBe('hasData')
      if (loadableAfter.state === 'hasData') {
        expect(loadableAfter.data).toEqual(capabilities)
      }
    })
  })
})

describe('isBundlingSupportedAsyncAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnectLegacy.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetRpcProvider.mockReturnValue({})
    setViemMigration(false)
  })

  it('returns false when walletInfoAtom yields no capabilities (disconnected)', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { chainId: MOCK_CHAIN_ID } as WalletInfo)

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns false when walletCapabilitiesAtom returns undefined', async () => {
    const store = createStore()
    const provider = createMockProvider(() => Promise.resolve(null))
    setWalletInfo(store, { provider })

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when isSafeAppAtom is true', async () => {
    const { isSafeAppAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeAppAtom, true)
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when isSafeViaWcAtom and capabilities atomic status is supported', async () => {
    const { isSafeViaWcAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeViaWcAtom, true)
    store.set(gnosisSafeInfoAtom, { address: '0x', threshold: 1, owners: [], chainId: 1, nonce: 0 })
    const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
    const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
    const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
    setWalletInfo(store, { provider })

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when isSafeViaWcAtom and capabilities atomic status is ready', async () => {
    const { isSafeViaWcAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeViaWcAtom, true)
    const capabilities: WalletCapabilities = { atomic: { status: 'ready' } }
    const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
    const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
    setWalletInfo(store, { provider })

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom false even with supported status', async () => {
    const { isSafeViaWcAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeViaWcAtom, false)
    const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
    const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
    const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
    setWalletInfo(store, { provider })

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })
})

describe('isBundlingSupportedLoadableAtom and isBundlingSupportedAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnectLegacy.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetRpcProvider.mockReturnValue({})
    setViemMigration(false)
  })

  it('isBundlingSupportedAtom returns null while loading', async () => {
    const store = createStore()
    const provider = createMockProvider(
      () =>
        new Promise<WalletCapabilities>((resolve) =>
          setTimeout(() => resolve({ atomic: { status: 'supported' } }), 50),
        ),
    )
    setWalletInfo(store, { provider })

    const syncValue = store.get(isBundlingSupportedAtom)

    expect(syncValue).toBe(null)
    await store.get(isBundlingSupportedAsyncAtom)
    const afterResolve = store.get(isBundlingSupportedAtom)
    expect(afterResolve).toBe(false)
  })

  it('isBundlingSupportedAtom returns false when capabilities fail (data is false)', async () => {
    const { isSafeViaWcAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeViaWcAtom, true)
    const provider = createMockProvider(() => Promise.reject(new Error('network error')))
    setWalletInfo(store, { provider })

    store.get(isBundlingSupportedLoadableAtom)
    const asyncResult = await store.get(isBundlingSupportedAsyncAtom)
    const loadable = store.get(isBundlingSupportedLoadableAtom)
    const syncValue = store.get(isBundlingSupportedAtom)

    expect(asyncResult).toBe(false)
    expect(loadable.state).toBe('hasData')
    if (loadable.state === 'hasData') {
      expect(loadable.data).toBe(false)
    }
    expect(syncValue).toBe(false)
  })

  it('isBundlingSupportedAtom returns correct boolean when data is present', async () => {
    const { isSafeViaWcAtom } = require('../../web3-react/hooks/useWalletMetadata')
    const store = createStore()
    store.set(isSafeViaWcAtom, true)
    const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
    const chainIdHex = `0x${MOCK_CHAIN_ID.toString(16)}`
    const provider = createMockProvider(() => Promise.resolve({ [chainIdHex]: capabilities }))
    setWalletInfo(store, { provider })

    store.get(isBundlingSupportedLoadableAtom)
    const asyncResult = await store.get(isBundlingSupportedAsyncAtom)
    const syncValue = store.get(isBundlingSupportedAtom)

    expect(asyncResult).toBe(true)
    expect(syncValue).toBe(true)
  })
})
