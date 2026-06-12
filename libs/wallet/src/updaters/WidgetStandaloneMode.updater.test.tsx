import { isInjectedWidget } from '@cowprotocol/common-utils'

import { ConnectorController } from '@reown/appkit-controllers'
import { render, RenderResult, waitFor } from '@testing-library/react'
import { useConnection } from 'wagmi'

import { WidgetStandaloneModeUpdater } from './WidgetStandaloneMode.updater'

import { COW_WIDGET_CONNECTOR_ID, SAFE_CONNECTOR_ID } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { reownAppKit, wagmiAdapter } from '../wagmi/config'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
}))

jest.mock('../utils/connectWalletById', () => ({
  connectWalletById: jest.fn(),
}))

jest.mock('../utils/getIsSafeAppIframe', () => ({
  getIsSafeAppIframe: jest.fn(),
}))

jest.mock('../wagmi/config', () => ({
  reownAppKit: { disconnect: jest.fn() },
  wagmiAdapter: { disconnect: jest.fn(), syncConnections: jest.fn() },
}))

jest.mock('../wagmi/hooks/useDisconnectWallet', () => ({
  useDisconnectWallet: jest.fn(),
}))

jest.mock('@reown/appkit-controllers', () => ({
  ConnectorController: {
    subscribe: jest.fn(),
    state: { connectors: [], allConnectors: [] },
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
const connectorControllerSubscribeMock = ConnectorController.subscribe as jest.Mock

const disconnectMock = jest.fn()

const OTHER_CONNECTOR_ID = 'metamask'

const DAPP_MODE = false
const STANDALONE_MODE = true

function setConnector(id: string | undefined): void {
  useConnectionMock.mockReturnValue({ connector: id ? { id } : undefined })
}

function renderUpdater(standaloneMode: boolean | undefined): RenderResult {
  return render(<WidgetStandaloneModeUpdater standaloneMode={standaloneMode} />)
}

beforeEach(() => {
  jest.clearAllMocks()

  isInjectedWidgetMock.mockReturnValue(true)
  getIsSafeAppIframeMock.mockReturnValue(false)
  reownAppKitDisconnectMock.mockResolvedValue(undefined)
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
    it('disconnects a non-widget connector in dapp mode', () => {
      setConnector(OTHER_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

      expect(disconnectMock).toHaveBeenCalledTimes(1)
    })

    it('keeps the widget connector in dapp mode', () => {
      setConnector(COW_WIDGET_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

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

    it('disconnects the Safe connector when not inside the Safe App iframe', () => {
      getIsSafeAppIframeMock.mockReturnValue(false)
      setConnector(SAFE_CONNECTOR_ID)

      renderUpdater(DAPP_MODE)

      expect(disconnectMock).toHaveBeenCalledTimes(1)
    })
  })
})
