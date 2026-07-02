import { isInjectedWidget } from '@cowprotocol/common-utils'

import { injected, safe } from '@wagmi/connectors'

import { getConnectors } from './getConnectors'

import { COW_WIDGET_CONNECTOR_ID } from '../reown/consts'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'

import type { EIP1193Provider } from 'viem'
import type { CreateConnectorFn } from 'wagmi'

let mockIsMobile = false
const mockBrowserInjectedConnector = (() => undefined) as unknown as CreateConnectorFn
const mockWidgetConnector = (() => undefined) as unknown as CreateConnectorFn
const mockSafeConnector = (() => undefined) as unknown as CreateConnectorFn

jest.mock('@cowprotocol/common-utils', () => ({
  get isMobile() {
    return mockIsMobile
  },
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

jest.mock('../providerIsolation', () => ({
  createIsolatedProvider: jest.fn((provider: EIP1193Provider) => ({ ...provider, isolated: true })),
}))

const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const getIsSafeAppIframeMock = getIsSafeAppIframe as jest.MockedFunction<typeof getIsSafeAppIframe>
const injectedMock = injected as jest.MockedFunction<typeof injected>
const safeMock = safe as jest.MockedFunction<typeof safe>

describe('getConnectors', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsMobile = false
    isInjectedWidgetMock.mockReturnValue(false)
    getIsSafeAppIframeMock.mockReturnValue(false)
  })

  it('does not add the browser injected connector in desktop regular app mode', () => {
    expect(getConnectors()).toBeUndefined()
    expect(injectedMock).not.toHaveBeenCalled()
  })

  it('adds the isolated browser injected connector on mobile regular app mode', () => {
    mockIsMobile = true

    expect(getConnectors()).toEqual([mockBrowserInjectedConnector])
    expect(injectedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ id: 'injected' }),
        shimDisconnect: false,
      }),
    )
  })

  it('wraps the browser injected provider with tab isolation', async () => {
    mockIsMobile = true

    getConnectors()

    const injectedCall = injectedMock.mock.calls.find(([params]) => params?.target?.id === 'injected')
    const providerFactory = injectedCall?.[0]?.target?.provider as (targetWindow?: {
      ethereum?: unknown
    }) => EIP1193Provider | undefined

    expect(typeof providerFactory).toBe('function')

    const rawProvider = { request: jest.fn(), on: jest.fn(), removeListener: jest.fn() } as unknown as EIP1193Provider
    const isolated = providerFactory({ ethereum: rawProvider })

    expect(isolated).toEqual(expect.objectContaining({ isolated: true }))
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
