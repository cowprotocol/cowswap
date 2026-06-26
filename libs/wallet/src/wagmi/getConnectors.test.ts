import { isInjectedWidget } from '@cowprotocol/common-utils'

import { injected, safe } from '@wagmi/connectors'

import { getConnectors } from './getConnectors'

import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

import type { EIP1193Provider } from 'viem'
import type { CreateConnectorFn } from 'wagmi'

const mockBrowserInjectedConnector = (() => undefined) as unknown as CreateConnectorFn
const mockWidgetConnector = (() => undefined) as unknown as CreateConnectorFn
const mockSafeConnector = (() => undefined) as unknown as CreateConnectorFn

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('@cowprotocol/iframe-transport', () => ({
  WidgetEthereumProvider: jest.fn(),
}))

jest.mock('@wagmi/connectors', () => ({
  injected: jest.fn((params: { target?: { id?: string } }) =>
    params.target?.id === 'cow-widget' ? mockWidgetConnector : mockBrowserInjectedConnector,
  ),
  safe: jest.fn(() => mockSafeConnector),
}))

jest.mock('../utils/getIsSafeAppIframe', () => ({
  getIsSafeAppIframe: jest.fn(),
}))

const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const getIsSafeAppIframeMock = getIsSafeAppIframe as jest.MockedFunction<typeof getIsSafeAppIframe>
const injectedMock = injected as jest.MockedFunction<typeof injected>
const safeMock = safe as jest.MockedFunction<typeof safe>

describe('getConnectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isInjectedWidgetMock.mockReturnValue(false)
    getIsSafeAppIframeMock.mockReturnValue(false)
  })

  it('adds the guarded browser injected connector in regular app mode', () => {
    expect(getConnectors()).toEqual([mockBrowserInjectedConnector])
    expect(injectedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ id: 'injected' }),
        shimDisconnect: true,
      }),
    )
  })

  it('wraps the browser injected provider with tab isolation', async () => {
    getConnectors()

    const injectedCall = injectedMock.mock.calls.find(([params]) => params?.target?.id === 'injected')
    const providerFactory = injectedCall?.[0]?.target?.provider as (targetWindow?: {
      ethereum?: unknown
    }) => EIP1193Provider | undefined

    expect(typeof providerFactory).toBe('function')

    const rawRequest = jest.fn()
    const rawProvider = { request: rawRequest, on: jest.fn(), removeListener: jest.fn() } as unknown as EIP1193Provider

    const isolated = providerFactory({ ethereum: rawProvider })

    // The connector must use an isolated wrapper, not the raw window.ethereum,
    // otherwise accountsChanged / wallet_revokePermissions bypass tab isolation.
    expect(isolated).toBeDefined()
    expect(isolated).not.toBe(rawProvider)

    // The isolated provider blocks origin-wide permission revocation.
    await isolated?.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
    expect(rawRequest).not.toHaveBeenCalled()
  })

  it('does not add the browser injected connector in Safe App mode', () => {
    getIsSafeAppIframeMock.mockReturnValue(true)

    expect(getConnectors()).toEqual([mockSafeConnector])
    expect(safeMock).toHaveBeenCalledWith({ unstable_getInfoTimeout: 1000 })
    expect(injectedMock).not.toHaveBeenCalled()
  })

  it('does not add the browser injected connector in injected widget mode', () => {
    isInjectedWidgetMock.mockReturnValue(true)

    expect(getConnectors()).toEqual([mockWidgetConnector])
    expect(injectedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ id: COW_WIDGET_CONNECTOR_ID }),
        shimDisconnect: false,
      }),
    )
  })
})
