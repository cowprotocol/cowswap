import { createStore, type WritableAtom } from 'jotai'

import type { EIP1193Provider, PublicClient } from 'viem'
import type { Connector } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'

import {
  getShouldSkipCapabilitiesCheck,
  isAtomicBatchSupportedAtom,
  isAtomicBatchSupportedAsyncAtom,
  isAtomicBatchSupportedLoadableAtom,
  resolveCapabilitiesForChain,
  walletCapabilitiesAtom,
} from './walletCapabilitiesAtom'

import {
  accountTypeAtom,
  isSafeAppAtom,
  isSafeViaWcAtom,
  isSafeWalletAtom,
  isSmartContractWalletAtom,
} from '../../wagmi/state/walletMetadata.atoms'
import { walletInfoAtom } from '../state'

/** Mocked module exports writable primitives; Jest widens atom types, so casts are required for store.set. */
const writableIsSafeAppAtom = isSafeAppAtom as WritableAtom<boolean | null, [boolean | null], unknown>
const writableIsSafeViaWcAtom = isSafeViaWcAtom as WritableAtom<boolean | null, [boolean | null], unknown>
const writableAccountTypeAtom = accountTypeAtom as WritableAtom<AccountType | null, [AccountType | null], unknown>
const writableIsSmartContractWalletAtom = isSmartContractWalletAtom as WritableAtom<
  boolean | null,
  [boolean | null],
  unknown
>
const writableIsSafeWalletAtom = isSafeWalletAtom as WritableAtom<boolean, [boolean], unknown>

import type { WalletCapabilities } from './walletCapabilitiesAtom'
import type { WalletInfo } from '../types'

jest.mock('../../wagmi/state/walletMetadata.atoms', () => {
  const jotai = require('jotai') as typeof import('jotai')

  return {
    isSafeAppAtom: jotai.atom(false),
    isSafeViaWcAtom: jotai.atom(false),
    accountTypeAtom: jotai.atom('EOA'),
    isSmartContractWalletAtom: jotai.atom(false),
    isSafeWalletAtom: jotai.atom(false),
  }
})

const MOCK_ACCOUNT = '0x1234567890123456789012345678901234567890' as const
const MOCK_CHAIN_ID = SupportedChainId.MAINNET
const MOCK_CONNECTOR = { type: 'injected' } as Connector

const mockGetCapabilities = jest.fn()
const mockWagmiConfigGetClient = jest.fn()
const mockGetIsWalletConnect = jest.fn()
const mockIsMobile = { value: false }

jest.mock('@cowprotocol/common-utils', () => {
  const actual = jest.requireActual<typeof import('@cowprotocol/common-utils')>('@cowprotocol/common-utils')

  return {
    ...actual,
    getCurrentChainIdFromUrl: () => 1,
    get isMobile() {
      return mockIsMobile.value
    },
  }
})

jest.mock('../../wagmi/hooks/useIsWalletConnect', () => ({
  getIsWalletConnect: (...args: unknown[]) => mockGetIsWalletConnect(...args),
}))

jest.mock('viem/actions', () => ({
  getCapabilities: (...args: unknown[]) => mockGetCapabilities(...args),
}))

jest.mock('../../wagmi/config', () => ({
  wagmiConfig: {
    getClient: (...args: unknown[]) => mockWagmiConfigGetClient(...args),
  },
}))

function createMockEip1193Provider(request = jest.fn()): EIP1193Provider {
  return {
    request,
    on: jest.fn(),
    removeListener: jest.fn(),
  } as unknown as EIP1193Provider
}

function seedResolvedWalletMetadata(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    accountType: AccountType | null
    isSafeWallet: boolean
    isSmartContractWallet: boolean | null
    isSafeViaWc: boolean
    isSafeApp: boolean
  }> = {},
): void {
  store.set(writableAccountTypeAtom, overrides.accountType ?? AccountType.EOA)
  store.set(writableIsSafeWalletAtom, overrides.isSafeWallet ?? false)
  store.set(
    writableIsSmartContractWalletAtom,
    'isSmartContractWallet' in overrides ? (overrides.isSmartContractWallet ?? null) : false,
  )
  store.set(writableIsSafeViaWcAtom, overrides.isSafeViaWc ?? false)
  store.set(writableIsSafeAppAtom, overrides.isSafeApp ?? false)
}

function setWalletInfo(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    account: string
    chainId: SupportedChainId
    connector: Connector
    provider: EIP1193Provider
  }> = {},
): void {
  store.set(walletInfoAtom, {
    chainId: overrides.chainId ?? MOCK_CHAIN_ID,
    account: overrides.account ?? MOCK_ACCOUNT,
    connector: overrides.connector ?? MOCK_CONNECTOR,
    provider: overrides.provider ?? createMockEip1193Provider(),
  })
}

describe('resolveCapabilitiesForChain', () => {
  const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }

  it('matches numeric chain id key', () => {
    expect(resolveCapabilitiesForChain({ [MOCK_CHAIN_ID]: capabilities }, MOCK_CHAIN_ID)).toEqual(capabilities)
  })

  it('matches hex chain id key', () => {
    expect(resolveCapabilitiesForChain({ '0x1': capabilities }, MOCK_CHAIN_ID)).toEqual(capabilities)
  })

  it('falls back to the first entry when no chain key matches', () => {
    expect(resolveCapabilitiesForChain({ '0x64': capabilities }, MOCK_CHAIN_ID)).toEqual(capabilities)
  })

  it('returns null for empty capabilities', () => {
    expect(resolveCapabilitiesForChain({}, MOCK_CHAIN_ID)).toBeNull()
  })
})

describe('getShouldSkipCapabilitiesCheck', () => {
  beforeEach(() => {
    mockIsMobile.value = false
    mockGetIsWalletConnect.mockReturnValue(false)
  })

  it('returns false on desktop', async () => {
    expect(await getShouldSkipCapabilitiesCheck(MOCK_CONNECTOR, createMockEip1193Provider())).toBe(false)
  })

  it('returns true on mobile WalletConnect', async () => {
    mockIsMobile.value = true
    mockGetIsWalletConnect.mockReturnValue(true)

    expect(await getShouldSkipCapabilitiesCheck(MOCK_CONNECTOR, createMockEip1193Provider())).toBe(true)
  })
})

describe('walletCapabilitiesAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.value = false
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  it('returns null when isSafeViaWc is still loading', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, null)
    setWalletInfo(store)

    const result = await store.get(walletCapabilitiesAtom)

    expect(result).toBeNull()
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns null on mobile WalletConnect without fetching capabilities', async () => {
    mockIsMobile.value = true
    mockGetIsWalletConnect.mockReturnValue(true)

    const store = createStore()
    setWalletInfo(store)

    const result = await store.get(walletCapabilitiesAtom)

    expect(result).toBeNull()
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  describe('walletInfoAtom state: missing required fields', () => {
    it('returns null when account is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        connector: MOCK_CONNECTOR,
        provider: createMockEip1193Provider(),
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
        provider: createMockEip1193Provider(),
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
        provider: createMockEip1193Provider(),
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })

    it('returns null when provider is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
        connector: MOCK_CONNECTOR,
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })
  })

  describe('getCapabilities (viem)', () => {
    it('returns capabilities when getCapabilities resolves for the current chain', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue(capabilities)

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalled()
      expect(mockWagmiConfigGetClient).toHaveBeenCalledWith({ chainId: MOCK_CHAIN_ID })
    })

    it('returns empty capabilities object when getCapabilities resolves with no fields', async () => {
      mockGetCapabilities.mockResolvedValue({})

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual({})
    })

    it('returns null when getCapabilities and wallet_getCapabilities both fail', async () => {
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      const mockRequest = jest.fn().mockRejectedValue(new Error('legacy error'))

      const store = createStore()
      setWalletInfo(store, { provider: createMockEip1193Provider(mockRequest) })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockRequest).toHaveBeenCalledWith({
        method: 'wallet_getCapabilities',
        params: [MOCK_ACCOUNT],
      })
    })

    it('returns null when getCapabilities fails and provider does not support EIP-1193 requests', async () => {
      const error = new Error('viem error')
      mockGetCapabilities.mockRejectedValue(error)

      const store = createStore()
      setWalletInfo(store, { provider: {} as PublicClient })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when getCapabilities times out and provider does not support EIP-1193 requests', async () => {
      jest.useFakeTimers()
      mockGetCapabilities.mockImplementation(() => new Promise(() => undefined))

      const store = createStore()
      setWalletInfo(store, { provider: {} as PublicClient })

      try {
        const resultPromise = store.get(walletCapabilitiesAtom)
        await jest.advanceTimersByTimeAsync(5_000)
        const result = await resultPromise

        expect(result).toBeNull()
      } finally {
        jest.useRealTimers()
      }
    })
  })

  describe('wallet_getCapabilities legacy fallback', () => {
    it('returns capabilities resolved from hex chain id key when viem throws', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      const mockRequest = jest.fn().mockResolvedValue({ '0x1': capabilities })

      const store = createStore()
      setWalletInfo(store, { provider: createMockEip1193Provider(mockRequest) })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('falls back to the first legacy capability entry when chain key is missing', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      const mockRequest = jest.fn().mockResolvedValue({ '0x64': capabilities })

      const store = createStore()
      setWalletInfo(store, { provider: createMockEip1193Provider(mockRequest) })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('uses legacy fallback when getCapabilities times out', async () => {
      jest.useFakeTimers()
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockImplementation(() => new Promise(() => undefined))
      const mockRequest = jest.fn().mockResolvedValue({ '0x1': capabilities })

      const store = createStore()
      setWalletInfo(store, { provider: createMockEip1193Provider(mockRequest) })

      try {
        const resultPromise = store.get(walletCapabilitiesAtom)
        await jest.advanceTimersByTimeAsync(5_000)
        const result = await resultPromise

        expect(result).toEqual(capabilities)
        expect(mockRequest).toHaveBeenCalledWith({
          method: 'wallet_getCapabilities',
          params: [MOCK_ACCOUNT],
        })
      } finally {
        jest.useRealTimers()
      }
    })

    it('returns null when legacy fallback times out', async () => {
      jest.useFakeTimers()
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      const mockRequest = jest.fn().mockImplementation(() => new Promise(() => undefined))

      const store = createStore()
      setWalletInfo(store, { provider: createMockEip1193Provider(mockRequest) })

      try {
        const resultPromise = store.get(walletCapabilitiesAtom)
        await jest.advanceTimersByTimeAsync(5_000)
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
    mockIsMobile.value = false
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  it('returns false when walletInfoAtom yields no capabilities (disconnected)', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store)
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

  it('returns false when isSafeViaWcAtom and capabilities atomic status is ready', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'ready' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
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

  it('does not wait on Safe info for EOA when gnosisSafeInfo is still undefined', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { accountType: AccountType.EOA, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
    expect(mockGetCapabilities).toHaveBeenCalled()
  })

  it('returns false for smart contract wallet before Safe info confirms a Safe', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { isSmartContractWallet: true, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for non-Safe smart contract wallet before checking capabilities', async () => {
    const store = createStore()
    store.set(writableIsSmartContractWalletAtom, true)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for EIP-7702 account before checking capabilities', async () => {
    const store = createStore()
    store.set(writableAccountTypeAtom, AccountType.EIP7702EOA)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ atomic: { status: 'supported' } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })
})

describe('isAtomicBatchSupportedLoadableAtom and isAtomicBatchSupportedAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.value = false
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
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
    setWalletInfo(store, {
      provider: createMockEip1193Provider(jest.fn().mockRejectedValue(new Error('legacy error'))),
    })

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
