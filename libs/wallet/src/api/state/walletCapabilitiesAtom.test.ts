import { createStore, type WritableAtom } from 'jotai'

import type { Connector } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  isAtomicBatchSupportedAtom,
  isAtomicBatchSupportedAsyncAtom,
  isAtomicBatchSupportedLoadableAtom,
  REQUEST_TIMEOUT_MS,
  walletCapabilitiesAtom,
} from './walletCapabilitiesAtom'

import { isSafeAppAtom, isSafeViaWcAtom } from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

/** Mocked module exports writable primitives; Jest widens atom types, so casts are required for store.set. */
const writableIsSafeAppAtom = isSafeAppAtom as WritableAtom<boolean | null, [boolean | null], unknown>
const writableIsSafeViaWcAtom = isSafeViaWcAtom as WritableAtom<boolean | null, [boolean | null], unknown>

import type { WalletCapabilities } from './walletCapabilitiesAtom'
import type { WalletInfo } from '../types'

jest.mock('../../wagmi/state/walletMetadata.atoms', () => {
  const jotai = require('jotai') as typeof import('jotai')

  return {
    isSafeAppAtom: jotai.atom(false),
    isSafeViaWcAtom: jotai.atom(false),
  }
})

const MOCK_ACCOUNT = '0x1234567890123456789012345678901234567890' as const
const MOCK_CHAIN_ID = SupportedChainId.MAINNET
const MOCK_CONNECTOR = { type: 'injected' } as Connector

const mockGetCapabilities = jest.fn()

jest.mock('wagmi/actions', () => ({
  getCapabilities: (...args: unknown[]) => mockGetCapabilities(...args),
}))

jest.mock('../../wagmi/config', () => ({
  wagmiConfig: {},
}))

function setWalletInfo(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    account: string
    chainId: SupportedChainId
    connector: Connector
  }> = {},
): void {
  store.set(walletInfoAtom, {
    chainId: overrides.chainId ?? MOCK_CHAIN_ID,
    account: overrides.account ?? MOCK_ACCOUNT,
    connector: overrides.connector ?? MOCK_CONNECTOR,
  })
}

describe('walletCapabilitiesAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCapabilities.mockResolvedValue({})
  })

  describe('walletInfoAtom state: missing required fields', () => {
    it('returns null when account is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        connector: MOCK_CONNECTOR,
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })

    it('returns null when chainId is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        account: MOCK_ACCOUNT,
        connector: MOCK_CONNECTOR,
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })

    it('returns null when connector is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })
  })

  describe('getCapabilities (wagmi)', () => {
    it('returns capabilities when getCapabilities resolves for the current chain', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue(capabilities)

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          account: MOCK_ACCOUNT,
          chainId: MOCK_CHAIN_ID,
          connector: MOCK_CONNECTOR,
        }),
      )
    })

    it('returns empty capabilities object when getCapabilities resolves with no fields', async () => {
      mockGetCapabilities.mockResolvedValue({})

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual({})
    })

    it('returns null when getCapabilities fails', async () => {
      mockGetCapabilities.mockRejectedValue(new Error('wagmi error'))

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when getCapabilities times out', async () => {
      jest.useFakeTimers()
      mockGetCapabilities.mockImplementation(() => new Promise(() => undefined))

      const store = createStore()
      setWalletInfo(store)

      try {
        const resultPromise = store.get(walletCapabilitiesAtom)
        await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)
        const result = await resultPromise

        expect(result).toBeNull()
      } finally {
        jest.useRealTimers()
      }
    })
  })
})

describe('isAtomicBatchSupportedAsyncAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCapabilities.mockResolvedValue({})
  })

  it('returns false when walletInfoAtom yields no capabilities (disconnected)', async () => {
    const store = createStore()
    store.set(walletInfoAtom, { chainId: MOCK_CHAIN_ID } as WalletInfo)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns false when walletCapabilitiesAtom returns empty capabilities', async () => {
    mockGetCapabilities.mockResolvedValue({})

    const store = createStore()
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when isSafeAppAtom is true', async () => {
    const store = createStore()
    store.set(writableIsSafeAppAtom, true)
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when isSafeViaWcAtom and capabilities atomic status is supported', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when isSafeViaWcAtom and capabilities atomic status is ready', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'ready' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when atomicBatch.supported is true', async () => {
    const store = createStore()
    mockGetCapabilities.mockResolvedValue({ atomicBatch: { supported: true } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom is true but capabilities fetch returns empty object', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({})
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when isSafeViaWcAtom is false and capabilities report supported', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, false)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })
})

describe('isAtomicBatchSupportedLoadableAtom and isAtomicBatchSupportedAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCapabilities.mockResolvedValue({})
  })

  it('isAtomicBatchSupportedAtom returns null while loading', async () => {
    mockGetCapabilities.mockImplementation(
      () =>
        new Promise<WalletCapabilities>((resolve) =>
          setTimeout(() => resolve({ atomic: { status: 'supported' } }), 50),
        ),
    )

    const store = createStore()
    setWalletInfo(store)

    const syncValue = store.get(isAtomicBatchSupportedAtom)

    expect(syncValue).toBe(null)
    await store.get(isAtomicBatchSupportedAsyncAtom)
    const afterResolve = store.get(isAtomicBatchSupportedAtom)
    expect(afterResolve).toBe(true)
  })

  it('isAtomicBatchSupportedAtom returns false when capabilities fail and Safe shortcuts do not apply', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, false)
    store.set(writableIsSafeAppAtom, false)
    mockGetCapabilities.mockRejectedValue(new Error('network error'))
    setWalletInfo(store)

    store.get(isAtomicBatchSupportedLoadableAtom)
    const asyncResult = await store.get(isAtomicBatchSupportedAsyncAtom)
    const loadable = store.get(isAtomicBatchSupportedLoadableAtom)
    const syncValue = store.get(isAtomicBatchSupportedAtom)

    expect(asyncResult).toBe(false)
    expect(loadable.state).toBe('hasData')
    if (loadable.state === 'hasData') {
      expect(loadable.data).toBe(false)
    }
    expect(syncValue).toBe(false)
  })

  it('isAtomicBatchSupportedAtom returns correct boolean when data is present', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    store.get(isAtomicBatchSupportedLoadableAtom)
    const asyncResult = await store.get(isAtomicBatchSupportedAsyncAtom)
    const syncValue = store.get(isAtomicBatchSupportedAtom)

    expect(asyncResult).toBe(true)
    expect(syncValue).toBe(true)
  })
})
