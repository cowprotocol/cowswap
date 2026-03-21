import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Connector } from '@web3-react/types'

import { cleanupActivationError, getPendingConnection, getRetryConnector } from './useActivateConnector.utils'

import { ConnectionType } from '../../api/types'

const mockGetWeb3ReactConnection = jest.fn()
const mockGetWalletConnectV2Connection = jest.fn()
const mockResetWalletConnectV2Connection = jest.fn()

jest.mock('../connection/walletConnectV2.utils', () => ({
  getWalletConnectV2Connection: (chainId: SupportedChainId) => mockGetWalletConnectV2Connection(chainId),
  resetWalletConnectV2Connection: (chainId: SupportedChainId) => mockResetWalletConnectV2Connection(chainId),
}))

jest.mock('../utils/getWeb3ReactConnection', () => ({
  getWeb3ReactConnection: (connector: Connector | ConnectionType) => mockGetWeb3ReactConnection(connector),
}))

describe('useActivateConnector utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('resolves WalletConnect retries through the original chain cache entry', () => {
    const freshConnector = { activate: jest.fn() } as unknown as Connector

    mockGetWalletConnectV2Connection.mockReturnValue({
      connector: freshConnector,
      type: ConnectionType.WALLET_CONNECT_V2,
    })

    const pendingConnection = getPendingConnection(ConnectionType.WALLET_CONNECT_V2, SupportedChainId.GNOSIS_CHAIN)

    expect(pendingConnection).toEqual({
      connectionType: ConnectionType.WALLET_CONNECT_V2,
      walletConnectChainId: SupportedChainId.GNOSIS_CHAIN,
    })
    expect(getRetryConnector(pendingConnection)).toBe(freshConnector)
    expect(mockGetWalletConnectV2Connection).toHaveBeenCalledWith(SupportedChainId.GNOSIS_CHAIN)
  })

  it('resets cached WalletConnect connections after transient activation errors', () => {
    const deactivate = jest.fn<Promise<void>, []>().mockResolvedValue()
    const connector = { deactivate, provider: {} } as unknown as Connector

    return cleanupActivationError(connector, {
      connectionType: ConnectionType.WALLET_CONNECT_V2,
      walletConnectChainId: SupportedChainId.MAINNET,
    }).then(() => {
      expect(deactivate).toHaveBeenCalledTimes(1)
      expect(mockResetWalletConnectV2Connection).toHaveBeenCalledWith(SupportedChainId.MAINNET)
    })
  })

  it('resolves non-WalletConnect retries through the connection type lookup', () => {
    const connector = { activate: jest.fn() } as unknown as Connector

    mockGetWeb3ReactConnection.mockImplementation((value: Connector | ConnectionType) => {
      if (value === ConnectionType.INJECTED) {
        return { connector, type: ConnectionType.INJECTED }
      }

      throw new Error('unsupported test connector')
    })

    expect(getRetryConnector(getPendingConnection(ConnectionType.INJECTED, SupportedChainId.MAINNET))).toBe(connector)
  })

  it('preserves cached WalletConnect connections when a live session already exists', () => {
    const deactivate = jest.fn<Promise<void>, []>().mockResolvedValue()
    const connector = { deactivate, provider: { session: { topic: 'wc-topic' } } } as unknown as Connector

    return cleanupActivationError(connector, {
      connectionType: ConnectionType.WALLET_CONNECT_V2,
      walletConnectChainId: SupportedChainId.MAINNET,
    }).then(() => {
      expect(deactivate).not.toHaveBeenCalled()
      expect(mockResetWalletConnectV2Connection).not.toHaveBeenCalled()
    })
  })

  it('keeps non-WalletConnect errors isolated from the cache reset path', () => {
    return cleanupActivationError({} as Connector, {
      connectionType: ConnectionType.INJECTED,
    }).then(() => {
      expect(mockResetWalletConnectV2Connection).not.toHaveBeenCalled()
    })
  })
})
