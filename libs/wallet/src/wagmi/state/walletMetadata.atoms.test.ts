import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'

import { waitFor } from '@testing-library/react'

import {
  accountTypeAsyncAtom,
  accountTypeLoadableAtom,
  isEoaAtom,
  isNetworkSwitchUnsupportedAtom,
  isSafeAppAtom,
  isSafeViaWcAtom,
  isSmartContractWalletAtom,
  safeAppsSdkAtom,
} from './walletMetadata.atoms'

import { gnosisSafeInfoAtom, walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType, WalletInfo } from '../../api/types'

const mockGetCode = jest.fn()

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  getPublicClient: () => ({
    getCode: (...args: unknown[]) => mockGetCode(...args),
  }),
}))

function createMockConnector(overrides: Record<string, unknown>): NonNullable<WalletInfo['connector']> {
  return {
    type: ConnectionType.INJECTED,
    ...overrides,
  } as unknown as NonNullable<WalletInfo['connector']>
}

function setWalletInfoConnector(
  store: ReturnType<typeof createStore>,
  connector: NonNullable<WalletInfo['connector']>,
): void {
  store.set(walletInfoAtom, {
    chainId: SupportedChainId.MAINNET,
    account: '0x1234567890123456789012345678901234567890',
    connector,
  })
}

describe('walletMetadata atoms', () => {
  beforeEach(() => {
    mockGetCode.mockReset()
    mockGetCode.mockImplementation(() => new Promise(() => undefined))
  })

  it('detects Safe app by connector.type', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.GNOSIS_SAFE,
      }),
    )

    expect(store.get(isSafeAppAtom)).toBe(true)
  })

  it('detects Safe app by connector.id', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        id: 'safe',
        type: ConnectionType.INJECTED,
      }),
    )

    expect(store.get(isSafeAppAtom)).toBe(true)
  })

  it('returns null when connector is not set yet', () => {
    const store = createStore()

    store.set(walletInfoAtom, {
      chainId: SupportedChainId.MAINNET,
      account: '0x1234567890123456789012345678901234567890',
    })

    expect(store.get(isSafeAppAtom)).toBe(null)
  })

  it('does not detect Safe app for non-safe connector', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )

    expect(store.get(isSafeAppAtom)).toBe(false)
  })

  it('exposes Safe Apps SDK only while connected as a Safe app', () => {
    const store = createStore()

    expect(store.get(safeAppsSdkAtom)).toBeNull()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.GNOSIS_SAFE,
      }),
    )

    expect(store.get(safeAppsSdkAtom)).not.toBeNull()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )

    expect(store.get(safeAppsSdkAtom)).toBeNull()
  })

  it('treats Safe app and Safe via WalletConnect as unable to switch networks, except Rabby', () => {
    const store = createStore()

    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(false)

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.GNOSIS_SAFE,
      }),
    )

    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(true)

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: 'Safe',
      wcPeerName: 'Safe',
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(true)

    setWalletInfoConnector(
      store,
      createMockConnector({
        id: 'io.rabby',
        type: ConnectionType.INJECTED,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      nonce: 1,
      chainId: SupportedChainId.MAINNET,
    })

    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(false)
  })

  it('keeps network switching available for a Safe imported into an injected non-Rabby wallet', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      nonce: 0,
      chainId: SupportedChainId.MAINNET,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(true)
    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(false)
  })

  it('detects Safe via WalletConnect from wallet details', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: 'Safe',
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(true)
  })

  it('returns false for WalletConnect when peer name is missing and Safe info is not loaded', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: undefined,
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(false)
  })

  it('detects Safe via WalletConnect from gnosisSafeInfo when peer name is missing', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      chainId: SupportedChainId.MAINNET,
      nonce: 0,
    })
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: undefined,
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(true)
  })

  it('detects a Safe account imported into an injected wallet', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      chainId: SupportedChainId.MAINNET,
      nonce: 0,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(true)
  })

  it('waits for an injected wallet account type before treating it as EOA', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )

    expect(store.get(isEoaAtom)).toBe(null)
  })

  it('is not EOA while Safe-via-WC detection is still loading', () => {
    const store = createStore()

    store.set(walletInfoAtom, {
      chainId: SupportedChainId.MAINNET,
      account: '0x1234567890123456789012345678901234567890',
    })

    expect(store.get(isSafeViaWcAtom)).toBe(null)
    expect(store.get(isEoaAtom)).toBe(null)
  })

  it('is not EOA for Safe via WalletConnect', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: 'Safe',
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isEoaAtom)).toBe(false)
  })

  it('is not EOA for a Safe account imported into an injected wallet', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      chainId: SupportedChainId.MAINNET,
      nonce: 0,
    })

    expect(store.get(isEoaAtom)).toBe(false)
  })

  it('treats a Safe as a smart-contract wallet even while account type is unknown', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      chainId: SupportedChainId.MAINNET,
      nonce: 0,
    })

    expect(store.get(isSmartContractWalletAtom)).toBe(true)
  })

  it('keeps wallet type unknown when account-type lookup fails, and allows retry', async () => {
    mockGetCode.mockRejectedValueOnce(new Error('rpc down')).mockResolvedValueOnce('0x')

    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
      }),
    )

    expect(store.get(accountTypeLoadableAtom).state).toBe('loading')

    await expect(store.get(accountTypeAsyncAtom)).rejects.toThrow('rpc down')

    expect(store.get(accountTypeLoadableAtom).state).toBe('hasError')
    expect(store.get(isSmartContractWalletAtom)).toBe(null)
    expect(store.get(isEoaAtom)).toBe(null)

    store.set(accountTypeAsyncAtom)

    await waitFor(() => {
      expect(store.get(accountTypeLoadableAtom).state).toBe('hasData')
    })
    expect(store.get(accountTypeLoadableAtom)).toEqual({ state: 'hasData', data: AccountType.EOA })
    expect(store.get(isSmartContractWalletAtom)).toBe(false)
    expect(store.get(isEoaAtom)).toBe(true)
  })
})

describe('isNetworkSwitchUnsupportedAtom peer name', () => {
  it('keeps network switching when WalletConnect peer metadata is missing and the display name fell back to Safe', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.WALLET_CONNECT_V2,
      }),
    )
    store.set(gnosisSafeInfoAtom, {
      address: '0x1234567890123456789012345678901234567890',
      threshold: 1,
      owners: ['0x1234567890123456789012345678901234567890'],
      nonce: 0,
      chainId: SupportedChainId.MAINNET,
    })
    store.set(walletDetailsAtom, {
      isSmartContractWallet: true,
      isSupportedWallet: true,
      allowsOffchainSigning: false,
      isSafeApp: false,
      walletName: 'Safe',
      ensName: undefined,
      icon: undefined,
    })

    expect(store.get(isSafeViaWcAtom)).toBe(true)
    expect(store.get(isNetworkSwitchUnsupportedAtom)).toBe(false)
  })
})
