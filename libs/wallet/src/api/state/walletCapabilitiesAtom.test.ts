import { createStore, type WritableAtom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WidgetEthereumProvider } from '@cowprotocol/iframe-transport'
import { AccountType } from '@cowprotocol/types'

import { Connector } from 'wagmi'

import {
  getShouldSkipCapabilitiesCheck,
  isBundlingSupportedAtom,
  isBundlingSupportedAsyncAtom,
  isBundlingSupportedLoadableAtom,
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
import { ConnectionType } from '../types'

/** Mocked module exports writable primitives; Jest widens atom types, so casts are required for store.set. */
const writableIsSafeAppAtom = isSafeAppAtom as WritableAtom<boolean, [boolean], unknown>
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
import type { EIP1193Provider } from 'viem'

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

const mockIsMobile = jest.fn()
const mockGetIsWalletConnect = jest.fn()
const mockGetCapabilities = jest.fn()
const mockWagmiConfigGetClient = jest.fn()

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  isMobile: () => mockIsMobile(),
}))

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

function createMockConnector(getProviderImpl?: () => Promise<unknown>): WalletInfo['connector'] {
  return {
    type: ConnectionType.INJECTED,
    getProvider: jest.fn().mockImplementation(getProviderImpl ?? (() => Promise.resolve({ request: jest.fn() }))),
  } as unknown as WalletInfo['connector']
}

function createMockWalletProvider(): EIP1193Provider {
  return {
    request: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
  } as unknown as EIP1193Provider
}

function setWalletInfo(
  store: ReturnType<typeof createStore>,
  overrides: Partial<{
    account: string
    chainId: SupportedChainId
    connector: NonNullable<WalletInfo['connector']>
    provider: NonNullable<WalletInfo['provider']>
  }>,
): void {
  store.set(walletInfoAtom, {
    chainId: overrides.chainId ?? MOCK_CHAIN_ID,
    account: overrides.account ?? MOCK_ACCOUNT,
    connector: overrides.connector ?? createMockConnector(),
    provider: overrides.provider ?? createMockWalletProvider(),
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
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  describe('getShouldSkipCapabilitiesCheck (widget meta info)', () => {
    it('resolves false when WidgetEthereumProvider never sends meta (timeout)', async () => {
      jest.useFakeTimers()
      mockIsMobile.mockReturnValue(true)
      mockGetIsWalletConnect.mockReturnValue(false)
      const widgetProvider = new WidgetEthereumProvider({ eventSource: window, eventTarget: window })
      const connector = createMockConnector(() => Promise.resolve(widgetProvider)) as Connector

      const provider = (await connector.getProvider()) as NonNullable<WalletInfo['provider']>
      const promise = getShouldSkipCapabilitiesCheck(connector, provider)
      await jest.advanceTimersByTimeAsync(10_000)
      const result = await promise

      expect(result).toBe(false)
      jest.useRealTimers()
    })
  })

  it('returns null when isSafeViaWc is still loading', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, null)
    setWalletInfo(store, {})

    const result = await store.get(walletCapabilitiesAtom)

    expect(result).toBeNull()
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  describe('walletInfoAtom state: missing account, chainId, or connector', () => {
    it('returns null when account is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        connector: createMockConnector(),
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when chainId is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        account: MOCK_ACCOUNT,
        connector: createMockConnector(),
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when connector is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
      } as WalletInfo)

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when provider is missing', async () => {
      const store = createStore()
      store.set(walletInfoAtom, {
        chainId: MOCK_CHAIN_ID,
        account: MOCK_ACCOUNT,
        connector: createMockConnector(),
      })

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })
  })

  describe('getCapabilities (viem)', () => {
    it('returns capabilities when getCapabilities resolves with chainId key', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: capabilities })

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
      expect(mockGetCapabilities).toHaveBeenCalled()
      expect(mockWagmiConfigGetClient).toHaveBeenCalledWith({ chainId: MOCK_CHAIN_ID })
    })

    it('returns capabilities when getCapabilities resolves with hex chain id key', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ '0x1': capabilities })

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('returns null when chain key is missing and not Safe via WC', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'ready' } }
      mockGetCapabilities.mockResolvedValue({ '0x64': capabilities })

      const store = createStore()
      store.set(writableIsSafeViaWcAtom, false)
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns fallback capability when Safe via WC and chain key is missing', async () => {
      const capabilities: WalletCapabilities = { atomic: { status: 'supported' } }
      mockGetCapabilities.mockResolvedValue({ '0x64': capabilities })

      const store = createStore()
      store.set(writableIsSafeViaWcAtom, true)
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toEqual(capabilities)
    })

    it('returns null when getCapabilities resolves with empty capabilities', async () => {
      mockGetCapabilities.mockResolvedValue({})

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })

    it('returns null when getCapabilities throws', async () => {
      mockGetCapabilities.mockRejectedValue(new Error('viem error'))
      mockWagmiConfigGetClient.mockReturnValue({})

      const store = createStore()
      setWalletInfo(store, {})

      const result = await store.get(walletCapabilitiesAtom)

      expect(result).toBeNull()
    })
  })
})

describe('isBundlingSupportedAsyncAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  it('returns false when walletInfoAtom yields no capabilities (disconnected)', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store)
    store.set(walletInfoAtom, { chainId: MOCK_CHAIN_ID } as WalletInfo)

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns false when walletCapabilitiesAtom returns undefined', async () => {
    mockGetCapabilities.mockResolvedValue({})

    const store = createStore()
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when isSafeAppAtom is true', async () => {
    const store = createStore()
    store.set(writableIsSafeAppAtom, true)
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns true when isSafeViaWcAtom and capabilities atomic status is supported', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom and capabilities atomic status is ready', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'ready' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when atomicBatch.supported is true', async () => {
    const store = createStore()
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomicBatch: { supported: true } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('returns false when isSafeViaWcAtom is true but capabilities fetch returns undefined', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({})
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
  })

  it('returns true when isSafeViaWcAtom is false and capabilities report supported', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, false)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
  })

  it('does not wait on Safe info for EOA when gnosisSafeInfo is still undefined', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { accountType: AccountType.EOA, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(true)
    expect(mockGetCapabilities).toHaveBeenCalled()
  })

  it('returns false for smart contract wallet before Safe info confirms a Safe', async () => {
    const store = createStore()
    seedResolvedWalletMetadata(store, { isSmartContractWallet: true, isSafeWallet: false })
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for non-Safe smart contract wallet before checking capabilities', async () => {
    const store = createStore()
    store.set(writableIsSmartContractWalletAtom, true)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })

  it('returns false for EIP-7702 account before checking capabilities', async () => {
    const store = createStore()
    store.set(writableAccountTypeAtom, AccountType.EIP7702EOA)
    store.set(writableIsSafeWalletAtom, false)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    const result = await store.get(isBundlingSupportedAsyncAtom)

    expect(result).toBe(false)
    expect(mockGetCapabilities).not.toHaveBeenCalled()
  })
})

describe('isBundlingSupportedLoadableAtom and isBundlingSupportedAtom', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile.mockReturnValue(false)
    mockGetIsWalletConnect.mockReturnValue(false)
    mockGetCapabilities.mockResolvedValue({})
    mockWagmiConfigGetClient.mockReturnValue({ chainId: MOCK_CHAIN_ID })
  })

  it('isBundlingSupportedAtom returns null while loading', async () => {
    mockGetCapabilities.mockImplementation(
      () =>
        new Promise<Record<number, WalletCapabilities>>((resolve) =>
          setTimeout(() => resolve({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } }), 50),
        ),
    )

    const store = createStore()
    setWalletInfo(store, {})

    const syncValue = store.get(isBundlingSupportedAtom)

    expect(syncValue).toBe(null)
    await store.get(isBundlingSupportedAsyncAtom)
    const afterResolve = store.get(isBundlingSupportedAtom)
    expect(afterResolve).toBe(true)
  })

  it('isBundlingSupportedAtom returns false when capabilities fail and Safe shortcuts do not apply', async () => {
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, false)
    store.set(writableIsSafeAppAtom, false)
    mockGetCapabilities.mockRejectedValue(new Error('network error'))
    setWalletInfo(store, {})

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
    const store = createStore()
    store.set(writableIsSafeViaWcAtom, true)
    mockGetCapabilities.mockResolvedValue({ [MOCK_CHAIN_ID]: { atomic: { status: 'supported' } } })
    setWalletInfo(store, {})

    store.get(isBundlingSupportedLoadableAtom)
    const asyncResult = await store.get(isBundlingSupportedAsyncAtom)
    const syncValue = store.get(isBundlingSupportedAtom)

    expect(asyncResult).toBe(true)
    expect(syncValue).toBe(true)
  })
})
