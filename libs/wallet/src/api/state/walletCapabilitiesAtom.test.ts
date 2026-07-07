import { createStore, type WritableAtom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'

import {
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

const mockLogWalletWarn = jest.fn()
const mockGetCapabilities = jest.fn()
const mockWagmiConfigGetClient = jest.fn()

jest.mock('@cowprotocol/common-utils', () => ({
  getCurrentChainIdFromUrl: () => 1,
  logWallet: {
    warn: (...args: unknown[]) => mockLogWalletWarn(...args),
  },
}))

jest.mock('viem/actions', () => ({
  getCapabilities: (...args: unknown[]) => mockGetCapabilities(...args),
}))

jest.mock('../../wagmi/config', () => ({
  wagmiConfig: {
    getClient: (...args: unknown[]) => mockWagmiConfigGetClient(...args),
  },
}))

function setWalletInfo(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    account: string
    chainId: SupportedChainId
  }> = {},
): void {
  store.set(walletInfoAtom, {
    chainId: overrides.chainId ?? MOCK_CHAIN_ID,
    account: overrides.account ?? MOCK_ACCOUNT,
  })
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

describe('resolveCapabilitiesForChain', () => {
  const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }

  it('matches numeric chain id key', () => {
    expect(resolveCapabilitiesForChain({ [MOCK_CHAIN_ID]: capabilities }, MOCK_CHAIN_ID, false)).toEqual(capabilities)
  })

  it('matches hex chain id key (Safe WC format)', () => {
    expect(resolveCapabilitiesForChain({ '0x1': capabilities }, MOCK_CHAIN_ID, false)).toEqual(capabilities)
  })

  it('matches decimal string chain id key', () => {
    expect(resolveCapabilitiesForChain({ '1': capabilities }, MOCK_CHAIN_ID, false)).toEqual(capabilities)
  })

  it('uses first entry fallback only for Safe via WC', () => {
    expect(resolveCapabilitiesForChain({ '0xaa36a7': capabilities }, MOCK_CHAIN_ID, true)).toEqual(capabilities)
    expect(resolveCapabilitiesForChain({ '0xaa36a7': capabilities }, MOCK_CHAIN_ID, false)).toBeNull()
  })
})

describe('walletCapabilitiesAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  describe('walletInfoAtom state: missing account or chainId', () => {
    it('returns null when account is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })

    it('returns null when chainId is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        account: MOCK_ACCOUNT,
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
      expect(mockGetCapabilities).not.toHaveBeenCalled()
    })

    it('fetches capabilities when only account and chainId are set', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: capabilities })

      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalled()
    })
  })

  describe('getCapabilities (viem)', () => {
    it('returns capabilities when getCapabilities resolves with chainId key', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: capabilities })

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalled()
      expect(mockWagmiConfigGetClient).toHaveBeenCalledWith({ chainId: MOCK_CHAIN_ID })
    })

    it('returns capabilities when getCapabilities resolves with hex chain id key', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ '0x1': capabilities })

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('returns null when chain key is missing and not Safe via WC', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'ready' } }
      mockGetCapabilities.mockResolvedValue({ '0x64': capabilities })

      const store = createStore()
      store.set(writableIsSafeViaWcAtom, false)
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns fallback capability when Safe via WC and chain key is missing', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ '0x64': capabilities })

      const store = createStore()
      store.set(writableIsSafeViaWcAtom, true)
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('returns null when getCapabilities resolves with empty capabilities', async () => {
      mockGetCapabilities.mockResolvedValue({})

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when getCapabilities throws', async () => {
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      mockWagmiConfigGetClient.mockReturnValue({})

      const store = createStore()
      setWalletInfo(store)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when getCapabilities does not settle before timeout', async () => {
      jest.useFakeTimers()
      mockGetCapabilities.mockImplementation(() => new Promise(() => undefined))

      const store = createStore()
      setWalletInfo(store)

      const resultPromise = store.get(walletCapabilitiesAtom)
      await jest.advanceTimersByTimeAsync(5_000)
      const result = await resultPromise

      expect(result).toBeNull()
      expect(mockLogWalletWarn).toHaveBeenCalledWith(expect.stringContaining('Wallet capabilities loading timed out'))

      jest.useRealTimers()
    })
  })
})

describe('isAtomicBatchSupportedAsyncAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

  it('returns false when walletCapabilitiesAtom returns undefined', async () => {
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
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom and capabilities atomic status is ready', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'ready' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when atomicBatch.supported is true', async () => {
    const store = createStore()
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomicBatch: { supported: true } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom is true but capabilities fetch returns undefined', async () => {
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
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('does not wait on Safe info for EOA when gnosisSafeInfo is still undefined', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { accountType: AccountType.EOA, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(true)
    expect(mockGetCapabilities).toHaveBeenCalled()
  })

  it('returns false for smart contract wallet before Safe info confirms a Safe', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { isSmartContractWallet: true, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for non-Safe smart contract wallet before checking capabilities', async () => {
    const store = createStore()
    store.set(writableIsSmartContractWalletAtom, true)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for EIP-7702 account before checking capabilities', async () => {
    const store = createStore()
    store.set(writableAccountTypeAtom, AccountType.EIP7702EOA)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    const result = await store.get(isAtomicBatchSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })
})

describe('isAtomicBatchSupportedLoadableAtom and isAtomicBatchSupportedAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  it('isAtomicBatchSupportedAtom returns null while loading', async () => {
    mockGetCapabilities.mockImplementation(
      () =>
        new Promise<Record<number, WalletCapabilities>>((resolve) =>
          setTimeout(() => resolve({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } }), 50),
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
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store)

    store.get(isAtomicBatchSupportedLoadableAtom)
    const asyncResult = await store.get(isAtomicBatchSupportedAsyncAtom)
    const syncValue = store.get(isAtomicBatchSupportedAtom)

    expect(asyncResult).toBe(true)
    expect(syncValue).toBe(true)
  })
})
