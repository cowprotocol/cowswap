import { createStore } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { isSafeAppAtom, isSafeViaWcAtom } from './walletMetadata.atoms'

import { walletDetailsAtom, walletInfoAtom } from '../../api/state'
import { ConnectionType, WalletInfo } from '../../api/types'

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

  it('keeps backward compatibility with connector.connectionType', () => {
    const store = createStore()

    setWalletInfoConnector(
      store,
      createMockConnector({
        type: ConnectionType.INJECTED,
        connectionType: ConnectionType.GNOSIS_SAFE,
      }),
    )

    expect(store.get(isSafeAppAtom)).toBe(true)
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
})
