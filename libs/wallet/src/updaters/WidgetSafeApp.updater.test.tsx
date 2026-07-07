import { render, RenderResult, waitFor } from '@testing-library/react'
import { useConnection } from 'wagmi'

import { WidgetSafeApp } from './WidgetSafeApp.updater'

import { SAFE_CONNECTOR_ID } from '../reown/consts'
import { connectWalletById } from '../utils/connectWalletById'
import { getIsSafeAppIframe } from '../utils/getIsSafeAppIframe'
import { useDisconnectWallet } from '../wagmi/hooks/useDisconnectWallet'

jest.mock('wagmi', () => ({
  useConnection: jest.fn(),
}))

jest.mock('../utils/connectWalletById', () => ({
  connectWalletById: jest.fn(),
}))

jest.mock('../utils/getIsSafeAppIframe', () => ({
  getIsSafeAppIframe: jest.fn(),
}))

jest.mock('../wagmi/hooks/useDisconnectWallet', () => ({
  useDisconnectWallet: jest.fn(),
}))

const useConnectionMock = useConnection as jest.Mock
const connectWalletByIdMock = connectWalletById as jest.Mock
const getIsSafeAppIframeMock = getIsSafeAppIframe as jest.Mock
const useDisconnectWalletMock = useDisconnectWallet as jest.Mock

const disconnectMock = jest.fn()

const OTHER_CONNECTOR_ID = 'metamask'

function setConnector(id: string | undefined): void {
  useConnectionMock.mockReturnValue({ connector: id ? { id } : undefined })
}

function renderUpdater(): RenderResult {
  return render(<WidgetSafeApp />)
}

beforeEach(() => {
  jest.clearAllMocks()

  getIsSafeAppIframeMock.mockReturnValue(true)
  disconnectMock.mockResolvedValue(undefined)
  useDisconnectWalletMock.mockReturnValue(disconnectMock)
  setConnector(undefined)
})

describe('WidgetSafeApp', () => {
  describe('inside the Safe App iframe', () => {
    it('disconnects a non-safe connector and connects the Safe connector', async () => {
      setConnector(OTHER_CONNECTOR_ID)

      const callOrder: string[] = []
      disconnectMock.mockImplementation(async () => {
        callOrder.push('disconnect')
      })
      connectWalletByIdMock.mockImplementation(() => {
        callOrder.push('connect')
      })

      renderUpdater()

      await waitFor(() => {
        expect(callOrder).toEqual(['disconnect', 'connect'])
        expect(connectWalletByIdMock).toHaveBeenCalledWith(SAFE_CONNECTOR_ID, 'safe')
      })
    })

    it('keeps the Safe connector connected', () => {
      setConnector(SAFE_CONNECTOR_ID)

      renderUpdater()

      expect(disconnectMock).not.toHaveBeenCalled()
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('does nothing when there is no connector', () => {
      setConnector(undefined)

      renderUpdater()

      expect(disconnectMock).not.toHaveBeenCalled()
      expect(connectWalletByIdMock).not.toHaveBeenCalled()
    })

    it('only attempts to reconnect once while a disconnect is in progress', async () => {
      setConnector(OTHER_CONNECTOR_ID)

      // Keep the disconnect pending so the in-progress ref guard stays set across rerenders
      let resolveDisconnect: () => void = () => undefined
      disconnectMock.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveDisconnect = resolve
          }),
      )

      const { rerender } = renderUpdater()

      expect(disconnectMock).toHaveBeenCalledTimes(1)

      rerender(<WidgetSafeApp />)
      rerender(<WidgetSafeApp />)

      expect(disconnectMock).toHaveBeenCalledTimes(1)

      resolveDisconnect()

      await waitFor(() => {
        expect(connectWalletByIdMock).toHaveBeenCalledTimes(1)
      })
    })
  })
})
