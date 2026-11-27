import { ConnectorAlreadyConnectedError, useConnection } from 'wagmi'

import { isInjectedWidget, logWallet } from '@cowprotocol/common-utils'

import { ConnectorController, OptionsController } from '@reown/appkit-controllers'
import { act, render, RenderResult, waitFor } from '@testing-library/react'

import { WidgetStandaloneModeUpdater } from './WidgetStandaloneMode.updater'

import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { reownAppKit, wagmiAdapter } from '../wagmi/config'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
  logWallet: { error: jest.fn() },
  normalizeError: (err: unknown) => (err instanceof Error ? err : new Error(String(err))),
}))

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
  ConnectorAlreadyConnectedError: class MockConnectorAlreadyConnectedError extends Error {},
}))

jest.mock('../utils/connectWalletById', () => ({
  connectWalletById: jest.fn(),
}))

jest.mock('../utils/getIsSafeAppIframe', () => ({
  getIsSafeAppIframe: jest.fn(),
}))

jest.mock('../wagmi/config', () => ({
  reownAppKit: { disconnect: jest.fn() },
  wagmiAdapter: { disconnect: jest.fn(), syncConnections: jest.fn(), syncConnectors: jest.fn() },
}))

jest.mock('../providerIsolation', () => ({
  flushDeferredProviders: jest.fn(),
}))

jest.mock('../wagmi/hooks/useDisconnectWallet', () => ({
  useDisconnectWallet: jest.fn(),
}))

jest.mock('@reown/appkit-controllers', () => ({
  ConnectorController: {
    subscribe: jest.fn(),
    state: { connectors: [], allConnectors: [] },
  },
  OptionsController: {
    setEIP6963Enabled: jest.fn(),
  },
}))

const isInjectedWidgetMock = isInjectedWidget as jest.Mock
const useConnectionMock = useConnection as jest.Mock
const connectWalletByIdMock = connectWalletById as jest.Mock
const getIsSafeAppIframeMock = getIsSafeAppIframe as jest.Mock
const useDisconnectWalletMock = useDisconnectWallet as jest.Mock
const reownAppKitDisconnectMock = reownAppKit.disconnect as jest.Mock
const wagmiAdapterDisconnectMock = wagmiAdapter.disconnect as jest.Mock
const wagmiAdapterSyncConnectionsMock = wagmiAdapter.syncConnections as jest.Mock
const wagmiAdapterSyncConnectorsMock = wagmiAdapter.syncConnectors as jest.Mock
const optionsControllerSetEIP6963EnabledMock = OptionsController.setEIP6963Enabled as jest.Mock
const connectorControllerSubscribeMock = ConnectorController.subscribe as jest.Mock
const logWalletErrorMock = logWallet.error as jest.Mock

const disconnectMock = jest.fn()

const OTHER_CONNECTOR_ID = 'metamask'

const DAPP_MODE = false
const STANDALONE_MODE = true

function deferred(): { promise: Promise<void>; resolve(): void } {
  let resolve: () => void = () => undefined
  const promise = new Promise<void>((done) => (resolve = done))

  return { promise, resolve: () => resolve() }
}

async function renderSettledDappMode(): Promise<RenderResult> {
  setConnector(COW_WIDGET_CONNECTOR_ID)
  const result = renderUpdater(DAPP_MODE)
  await act(async () => undefined)
  connectWalletByIdMock.mockClear()
  reownAppKitDisconnectMock.mockClear()
  disconnectMock.mockClear()

  return result
}

function renderUpdater(standaloneMode: boolean | undefined): RenderResult {
  return render(<WidgetStandaloneModeUpdater standaloneMode={standaloneMode} />)
}

function setConnector(id: string | undefined): void {
  useConnectionMock.mockReturnValue({ connector: id ? { id } : undefined })
}

beforeEach(() => {
  jest.clearAllMocks()

  isInjectedWidgetMock.mockReturnValue(true)
  getIsSafeAppIframeMock.mockReturnValue(false)
  reownAppKitDisconnectMock.mockResolvedValue(undefined)
  connectWalletByIdMock.mockResolvedValue(undefined)
  wagmiAdapterDisconnectMock.mockResolvedValue(undefined)
  disconnectMock.mockResolvedValue(undefined)
  useDisconnectWalletMock.mockReturnValue(disconnectMock)
  ConnectorController.state.connectors = []
  ConnectorController.state.allConnectors = []
  setConnector(undefined)
})

describe('WidgetStandaloneModeUpdater', () => {
  describe('dapp mode: connecting to the widget connector', () => {
    it('disconnects the current wallet and connects the widget connector', async () => {
      setConnector(COW_WIDGET_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'injected')
      })

      expect(reownAppKitDisconnectMock).toHaveBeenCalledTimes(1)
    })

    it('disconnects before connecting the widget connector', async () => {
      const callOrder: string[] = []
      reownAppKitDisconnectMock.mockImplementation(async () => {
        callOrder.push('disconnect')
      })
      connectWalletByIdMock.mockImplementation(() => {
        callOrder.push('connect')
      })

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(callOrder).toEqual(['disconnect', 'connect'])
      })
    })

    it('does not connect the widget connector in standalone mode', () => {
      renderUpdater(STANDALONE_MODE)

      expect(reownAppKitDisconnectMock).not.toHaveBeenCalled()
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('does not connect the widget connector when the mode is undefined', () => {
      renderUpdater(undefined)

      expect(reownAppKitDisconnectMock).not.toHaveBeenCalled()
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('only attempts to connect the widget connector once', async () => {
      const { rerender } = renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      })

      // Toggle out of and back into dapp mode - the ref guard must prevent a second attempt
      rerender(<WidgetStandaloneModeUpdater standaloneMode={STANDALONE_MODE} />)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)

      expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
    })

    it('swallows ConnectorAlreadyConnectedError without logging (auto-reconnect or the bridge beat us to it)', async () => {
      connectWalletByIdMock.mockRejectedValue(new ConnectorAlreadyConnectedError())

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      })

      expect(logWalletErrorMock).not.toHaveBeenCalled()
    })

    it('connects the widget connector when disconnecting the current wallet fails', async () => {
      reownAppKitDisconnectMock.mockRejectedValue(new Error('disconnect failed'))

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'injected')
      })
    })

    it('does not connect the widget connector when dapp mode ends before the current wallet disconnects', async () => {
      const startupDisconnect = deferred()
      reownAppKitDisconnectMock.mockReturnValue(startupDisconnect.promise)

      const { rerender } = renderUpdater(DAPP_MODE)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={STANDALONE_MODE} />)
      await act(async () => startupDisconnect.resolve())

      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('waits for a running standalone disconnect before connecting the widget connector in dapp mode', async () => {
      setConnector(COW_WIDGET_CONNECTOR_ID)
      const standaloneDisconnect = deferred()
      disconnectMock.mockReturnValue(standaloneDisconnect.promise)

      const { rerender } = renderUpdater(STANDALONE_MODE)

      expect(disconnectMock).toHaveBeenCalledTimes(1)

      setConnector(undefined)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)
      await act(async () => undefined)

      expect(reownAppKitDisconnectMock).not.toHaveBeenCalled()
      expect(connectWalletByIdMock).not.toHaveBeenCalled()

      await act(async () => standaloneDisconnect.resolve())

      expect(reownAppKitDisconnectMock).toHaveBeenCalledTimes(1)
      expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'injected')
    })

    it('logs unexpected connect errors', async () => {
      connectWalletByIdMock.mockRejectedValue(new Error('provider unavailable'))

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(logWalletErrorMock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('standalone mode: injected wallet discovery', () => {
    it('enables EIP-6963 in standalone mode', () => {
      renderUpdater(STANDALONE_MODE)

      expect(optionsControllerSetEIP6963EnabledMock).toHaveBeenCalledWith(true)
      expect(wagmiAdapterSyncConnectorsMock).toHaveBeenCalledTimes(1)
    })

    it('enables EIP-6963 when standalone mode is undefined', () => {
      renderUpdater(undefined)

      expect(optionsControllerSetEIP6963EnabledMock).toHaveBeenCalledWith(true)
      expect(wagmiAdapterSyncConnectorsMock).toHaveBeenCalledTimes(1)
    })

    it('disables EIP-6963 in dapp mode', () => {
      renderUpdater(DAPP_MODE)

      expect(optionsControllerSetEIP6963EnabledMock).toHaveBeenCalledWith(false)
      expect(wagmiAdapterSyncConnectorsMock).not.toHaveBeenCalled()
    })

    it('does not change EIP-6963 outside injected widget mode', () => {
      isInjectedWidgetMock.mockReturnValue(false)

      renderUpdater(STANDALONE_MODE)

      expect(optionsControllerSetEIP6963EnabledMock).not.toHaveBeenCalled()
      expect(wagmiAdapterSyncConnectorsMock).not.toHaveBeenCalled()
    })
  })

  describe('standalone mode: disconnecting the widget configurator', () => {
    it('disconnects the widget connector and subscribes to the connector controller', () => {
      renderUpdater(STANDALONE_MODE)

      expect(wagmiAdapterDisconnectMock).toHaveBeenCalledWith({ id: COW_WIDGET_CONNECTOR_ID })
      expect(connectorControllerSubscribeMock).toHaveBeenCalledTimes(1)
    })

    it('does not disconnect the widget connector in dapp mode', () => {
      renderUpdater(DAPP_MODE)

      expect(wagmiAdapterDisconnectMock).not.toHaveBeenCalled()
      expect(connectorControllerSubscribeMock).not.toHaveBeenCalled()
    })

    it('removes the widget connector from the reown connection modal', () => {
      renderUpdater(STANDALONE_MODE)

      const onState = connectorControllerSubscribeMock.mock.calls[0][0]
      const remainingConnector = { id: OTHER_CONNECTOR_ID }

      onState({ connectors: [{ id: COW_WIDGET_CONNECTOR_ID }, remainingConnector] })

      expect(ConnectorController.state.connectors).toEqual([remainingConnector])
      expect(ConnectorController.state.allConnectors).toEqual([remainingConnector])
      expect(wagmiAdapterSyncConnectionsMock).toHaveBeenCalledTimes(1)
    })

    it('does nothing when the widget connector is not in the list', () => {
      renderUpdater(STANDALONE_MODE)

      const onState = connectorControllerSubscribeMock.mock.calls[0][0]
      const connectors = [{ id: OTHER_CONNECTOR_ID }]

      onState({ connectors })

      expect(wagmiAdapterSyncConnectionsMock).not.toHaveBeenCalled()
    })
  })

  describe('enforcing the allowed connector', () => {
    it('lets the dapp-mode reconnect change the connector first at mount', async () => {
      setConnector(OTHER_CONNECTOR_ID)
      const startupDisconnect = deferred()
      reownAppKitDisconnectMock.mockReturnValue(startupDisconnect.promise)

      renderUpdater(DAPP_MODE)

      expect(reownAppKitDisconnectMock).toHaveBeenCalledTimes(1)
      expect(disconnectMock).not.toHaveBeenCalled()

      setConnector(COW_WIDGET_CONNECTOR_ID)
      await act(async () => startupDisconnect.resolve())

      expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      expect(disconnectMock).not.toHaveBeenCalled()
    })

    it('replaces a non-widget connector that appears in dapp mode with the widget connector', async () => {
      const { rerender } = await renderSettledDappMode()
      const enforcementDisconnect = deferred()
      disconnectMock.mockReturnValue(enforcementDisconnect.promise)

      setConnector(OTHER_CONNECTOR_ID)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)
      await act(async () => undefined)

      expect(disconnectMock).toHaveBeenCalledTimes(1)
      expect(connectWalletByIdMock).not.toHaveBeenCalled()

      await act(async () => enforcementDisconnect.resolve())

      expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'injected')
    })

    it('does not connect the widget connector when dapp mode ends during the disconnect', async () => {
      const { rerender } = await renderSettledDappMode()
      const enforcementDisconnect = deferred()
      disconnectMock.mockReturnValue(enforcementDisconnect.promise)

      setConnector(OTHER_CONNECTOR_ID)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={STANDALONE_MODE} />)
      await act(async () => enforcementDisconnect.resolve())

      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('drops the widget connector that connected after the mode turned standalone', async () => {
      const { rerender } = await renderSettledDappMode()
      const widgetConnect = deferred()
      connectWalletByIdMock.mockReturnValue(widgetConnect.promise)

      setConnector(OTHER_CONNECTOR_ID)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)
      await act(async () => undefined)

      expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      expect(disconnectMock).toHaveBeenCalledTimes(1)

      setConnector(COW_WIDGET_CONNECTOR_ID)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={STANDALONE_MODE} />)

      expect(disconnectMock).toHaveBeenCalledTimes(1)

      await act(async () => widgetConnect.resolve())

      expect(disconnectMock).toHaveBeenCalledTimes(2)
    })

    it('connects the widget connector when a non-widget connector fails to disconnect in dapp mode', async () => {
      const { rerender } = await renderSettledDappMode()
      disconnectMock.mockRejectedValue(new Error('connector.disconnect is not a function'))

      setConnector(OTHER_CONNECTOR_ID)
      rerender(<WidgetStandaloneModeUpdater standaloneMode={DAPP_MODE} />)

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledWith(COW_WIDGET_CONNECTOR_ID, 'injected')
      })
    })

    it('does not connect the widget connector inside the Safe App iframe', async () => {
      getIsSafeAppIframeMock.mockReturnValue(true)
      setConnector(OTHER_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)
      await act(async () => undefined)

      expect(disconnectMock).toHaveBeenCalledTimes(1)
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('does not connect the widget connector after disconnecting it in standalone mode', async () => {
      setConnector(COW_WIDGET_CONNECTOR_ID)

      renderUpdater(STANDALONE_MODE)

      await waitFor(() => {
        expect(disconnectMock).toHaveBeenCalledTimes(1)
      })
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('keeps the widget connector in dapp mode', async () => {
      await renderSettledDappMode()

      expect(disconnectMock).not.toHaveBeenCalled()
    })

    it('disconnects the widget connector in standalone mode', () => {
      setConnector(COW_WIDGET_CONNECTOR_ID)

      renderUpdater(STANDALONE_MODE)

      expect(disconnectMock).toHaveBeenCalledTimes(1)
    })

    it('keeps a non-widget connector in standalone mode', () => {
      setConnector(OTHER_CONNECTOR_ID)

      renderUpdater(STANDALONE_MODE)

      expect(disconnectMock).not.toHaveBeenCalled()
    })

    it('does not disconnect the Safe connector inside the Safe App iframe', () => {
      getIsSafeAppIframeMock.mockReturnValue(true)
      setConnector(SAFE_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

      expect(disconnectMock).not.toHaveBeenCalled()
    })

    it('disconnects the Safe connector when not inside the Safe App iframe', async () => {
      getIsSafeAppIframeMock.mockReturnValue(false)
      setConnector(SAFE_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

      await waitFor(() => {
        expect(disconnectMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
