/**
 * Tests for getWeb3ReactConnection — verifies the connector/ConnectionType
 * resolution logic.
 *
 * All connection modules are mocked to prevent instantiation of real connectors
 * (which require browser APIs). The WalletConnectV2Connector class mock is
 * defined inline inside the jest.mock() factory to avoid hoisting issues.
 */

import { Connector } from '@web3-react/types'

import { ConnectionType } from '../../api/types'

import type { Web3ReactConnection } from '../types'

// ---------------------------------------------------------------------------
// A concrete Connector subclass we can freely instantiate in tests.
// This is NOT referenced inside any jest.mock() factory, so it can use `class`.
// ---------------------------------------------------------------------------

class StubConnector extends Connector {
  activate(): void {
    /* noop */
  }
}

const stubActions = {
  startActivation: jest.fn(() => jest.fn()),
  update: jest.fn(),
  resetState: jest.fn(),
}

// ---------------------------------------------------------------------------
// Sentinel objects — simple branded objects used as return values from mocked
// factories. We only need reference equality checks, so plain objects suffice.
// ---------------------------------------------------------------------------

const MOCK_COINBASE_CONNECTION = { __brand: 'coinbase' } as unknown as Web3ReactConnection
const MOCK_WC_CONNECTION = { __brand: 'wc' } as unknown as Web3ReactConnection

// Static connections need real Connector instances for the `.find()` lookup
const mockInjectedConnector = new StubConnector(stubActions)
const MOCK_INJECTED_CONNECTION: Web3ReactConnection = {
  connector: mockInjectedConnector,
  hooks: {} as Web3ReactConnection['hooks'],
  type: ConnectionType.INJECTED,
}

const MOCK_NETWORK_CONNECTION: Web3ReactConnection = {
  connector: new StubConnector(stubActions),
  hooks: {} as Web3ReactConnection['hooks'],
  type: ConnectionType.NETWORK,
}

const MOCK_SAFE_CONNECTION: Web3ReactConnection = {
  connector: new StubConnector(stubActions),
  hooks: {} as Web3ReactConnection['hooks'],
  type: ConnectionType.GNOSIS_SAFE,
}

const MOCK_TREZOR_CONNECTION: Web3ReactConnection = {
  connector: new StubConnector(stubActions),
  hooks: {} as Web3ReactConnection['hooks'],
  type: ConnectionType.TREZOR,
}

const MOCK_METAMASK_CONNECTION: Web3ReactConnection = {
  connector: new StubConnector(stubActions),
  hooks: {} as Web3ReactConnection['hooks'],
  type: ConnectionType.METAMASK,
}

const mockGetWalletConnectV2Connection = jest.fn().mockReturnValue(MOCK_WC_CONNECTION)

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock('@cowprotocol/common-utils', () => ({
  getCurrentChainIdFromUrl: jest.fn().mockReturnValue(1),
}))

jest.mock('../connection/coinbase', () => ({
  get coinbaseWalletConnection() {
    return MOCK_COINBASE_CONNECTION
  },
}))

jest.mock('../connection/injectedWallet', () => ({
  get injectedWalletConnection() {
    return MOCK_INJECTED_CONNECTION
  },
}))

jest.mock('../connection/metaMaskSdk', () => ({
  get metaMaskSdkConnection() {
    return MOCK_METAMASK_CONNECTION
  },
}))

jest.mock('../connection/network', () => ({
  get networkConnection() {
    return MOCK_NETWORK_CONNECTION
  },
}))

jest.mock('../connection/safe', () => ({
  get gnosisSafeConnection() {
    return MOCK_SAFE_CONNECTION
  },
}))

jest.mock('../connection/trezor', () => ({
  get trezorConnection() {
    return MOCK_TREZOR_CONNECTION
  },
}))

jest.mock('../connection/walletConnectV2', () => ({
  getWalletConnectV2Connection: mockGetWalletConnectV2Connection,
}))

// WalletConnectV2Connector mock: define the class inline so there's no
// hoisting issue. We need `instanceof` to work for StubConnector subclass.
jest.mock('../connectors/WalletConnectV2Connector', () => {
  // Return an empty class that nothing will actually be instanceof,
  // since we test the WC path via ConnectionType string.
  return {
    WalletConnectV2Connector: class MockWc {},
  }
})

// ---------------------------------------------------------------------------
// Import the function under test AFTER all mocks are in place.
// We use require() instead of import because import statements are hoisted
// above const declarations by Babel/TS, causing "Cannot access before
// initialization" when jest.mock factories reference those const bindings.
// ---------------------------------------------------------------------------

const { getWeb3ReactConnection } = require('./getWeb3ReactConnection') as typeof import('./getWeb3ReactConnection')

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('getWeb3ReactConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetWalletConnectV2Connection.mockReturnValue(MOCK_WC_CONNECTION)
  })

  it('returns generic WC connection for ConnectionType.WALLET_CONNECT_V2 string', () => {
    const result = getWeb3ReactConnection(ConnectionType.WALLET_CONNECT_V2)

    expect(result).toBe(MOCK_WC_CONNECTION)
    expect(mockGetWalletConnectV2Connection).toHaveBeenCalled()
  })

  it('returns coinbase wallet connection for ConnectionType.COINBASE_WALLET string', () => {
    const result = getWeb3ReactConnection(ConnectionType.COINBASE_WALLET)

    expect(result).toBe(MOCK_COINBASE_CONNECTION)
  })

  it('returns correct connection when passed a known static connector instance', () => {
    const result = getWeb3ReactConnection(mockInjectedConnector)

    expect(result).toBe(MOCK_INJECTED_CONNECTION)
  })

  it('throws for an unknown Connector instance', () => {
    const unknownConnector = new StubConnector(stubActions)

    expect(() => getWeb3ReactConnection(unknownConnector)).toThrow('unsupported connector')
  })

  it('returns connection for each static ConnectionType string', () => {
    expect(getWeb3ReactConnection(ConnectionType.INJECTED)).toBe(MOCK_INJECTED_CONNECTION)
    expect(getWeb3ReactConnection(ConnectionType.COINBASE_WALLET)).toBe(MOCK_COINBASE_CONNECTION)
    expect(getWeb3ReactConnection(ConnectionType.NETWORK)).toBe(MOCK_NETWORK_CONNECTION)
    expect(getWeb3ReactConnection(ConnectionType.GNOSIS_SAFE)).toBe(MOCK_SAFE_CONNECTION)
    expect(getWeb3ReactConnection(ConnectionType.TREZOR)).toBe(MOCK_TREZOR_CONNECTION)
    expect(getWeb3ReactConnection(ConnectionType.METAMASK)).toBe(MOCK_METAMASK_CONNECTION)
  })
})
