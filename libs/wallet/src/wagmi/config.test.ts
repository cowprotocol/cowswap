import { isInjectedWidget } from '@cowprotocol/common-utils'

import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

let mockIsMobile = false

jest.mock('@cowprotocol/common-utils', () => ({
  get isMobile() {
    return mockIsMobile
  },
  isInjectedWidget: jest.fn(),
}))

jest.mock('../utils/getIsSafeAppIframe', () => ({
  getIsSafeAppIframe: jest.fn(),
}))

jest.mock('../utils/connectWalletById', () => ({
  connectWalletById: jest.fn(() => Promise.resolve({})),
}))

jest.mock('@reown/appkit/react', () => ({
  createAppKit: jest.fn(() => ({})),
}))

jest.mock('@reown/appkit-adapter-solana', () => ({
  SolanaAdapter: jest.fn(),
}))

jest.mock('@reown/appkit-adapter-wagmi', () => ({
  WagmiAdapter: jest.fn(() => ({ wagmiConfig: { subscribe: jest.fn(), state: {} } })),
}))

jest.mock('@reown/appkit-controllers', () => ({
  OptionsController: { state: {}, setOptions: jest.fn() },
}))

jest.mock('./getConnectors', () => ({
  getConnectors: jest.fn(() => undefined),
}))

jest.mock('./getReownDefaultNetwork', () => ({
  getReownDefaultNetwork: jest.fn(() => ({})),
}))

jest.mock('../providerIsolation', () => ({
  interceptEIP6963Providers: jest.fn(),
}))

jest.mock('../bindActiveProvider', () => ({
  bindActiveProvider: jest.fn(),
}))

jest.mock('../wagmiStorage', () => ({
  wagmiStorage: { key: 'cowswap-wallet' },
}))

jest.mock('@cowprotocol/common-const', () => ({
  IS_SOLANA_ENABLED: false,
  RPC_URLS: {},
}))

jest.mock('../reown/networks', () => ({
  SUPPORTED_REOWN_NETWORKS: [],
}))

const createAppKitMock = jest.requireMock<{ createAppKit: jest.Mock }>('@reown/appkit/react').createAppKit
const connectWalletByIdMock = jest.requireMock<{ connectWalletById: jest.Mock }>(
  '../utils/connectWalletById',
).connectWalletById
const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const getIsSafeAppIframeMock = getIsSafeAppIframe as jest.MockedFunction<typeof getIsSafeAppIframe>

function loadConfig(): void {
  jest.isolateModules(() => {
    require('./config')
  })
}

function lastEnableReconnect(): boolean {
  const calls = createAppKitMock.mock.calls
  expect(calls.length).toBeGreaterThan(0)
  return (calls[calls.length - 1][0] as { enableReconnect: boolean }).enableReconnect
}

function setStoredConnector(id: string | null): void {
  const key = 'cowswap-wallet.recentConnectorId'
  if (id === null) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, id)
  }
}

describe('wagmi/config auto-connect wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile = false
    isInjectedWidgetMock.mockReturnValue(false)
    getIsSafeAppIframeMock.mockReturnValue(false)
    setStoredConnector(null)
    // window.ethereum for mobile branch
    Object.defineProperty(window, 'ethereum', { value: {}, writable: true, configurable: true })
  })

  it('enables reconnect and connects to Safe when running inside a Safe App iframe', () => {
    getIsSafeAppIframeMock.mockReturnValue(true)

    loadConfig()

    expect(lastEnableReconnect()).toBe(true)
    expect(connectWalletByIdMock).toHaveBeenCalledWith(SAFE_CONNECTOR_ID, 'safe')
  })

  // Regression guard for issue #7777: widget-inside-Safe stayed on "Connect wallet"
  // because enableReconnect was gated only by hasRecentConnector, so Reown never wired
  // the WidgetEthereumProvider transport at init.
  it('enables reconnect and connects the cow-widget connector when running as an injected widget', () => {
    isInjectedWidgetMock.mockReturnValue(true)

    loadConfig()

    expect(lastEnableReconnect()).toBe(true)
    expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'cow-widget')
  })

  it('enables reconnect on desktop when the user has a recent connector', () => {
    setStoredConnector('io.rabby')

    loadConfig()

    expect(lastEnableReconnect()).toBe(true)
    expect(connectWalletByIdMock).not.toHaveBeenCalled()
  })

  // Cross-app isolation guard (Elena round 1): a fresh desktop visit must NOT auto-reconnect
  // from a widget-owned localStorage namespace.
  it('disables reconnect and does not auto-connect for a fresh desktop visit', () => {
    loadConfig()

    expect(lastEnableReconnect()).toBe(false)
    expect(connectWalletByIdMock).not.toHaveBeenCalled()
  })

  it('auto-connects the injected connector on mobile with window.ethereum and a recent connector', () => {
    mockIsMobile = true
    setStoredConnector('injected')

    loadConfig()

    expect(lastEnableReconnect()).toBe(true)
    expect(connectWalletByIdMock).toHaveBeenCalledWith('injected', 'injected')
  })

  it('does not auto-connect the injected connector on mobile without a recent connector', () => {
    mockIsMobile = true

    loadConfig()

    expect(lastEnableReconnect()).toBe(false)
    expect(connectWalletByIdMock).not.toHaveBeenCalled()
  })
})
