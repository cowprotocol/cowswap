import { JSX, useState } from 'react'

import type { CowSwapWidgetHandler, CowSwapWidgetParams, EthereumProvider } from '@cowprotocol/widget-lib'
import { createCowSwapWidget } from '@cowprotocol/widget-lib'

import { render } from '@testing-library/react'

import { CowSwapWidget } from './CowSwapWidget'

jest.mock('@cowprotocol/widget-lib', () => ({
  createCowSwapWidget: jest.fn(),
}))

const createCowSwapWidgetMock = createCowSwapWidget as jest.MockedFunction<typeof createCowSwapWidget>

describe('CowSwapWidget', () => {
  beforeEach(() => {
    createCowSwapWidgetMock.mockReset()
    createCowSwapWidgetMock.mockImplementation(createWidgetHandler)
  })

  it('should render successfully', () => {
    expect(CowSwapWidget).toBeTruthy()
  })

  it('recreates the widget when the Safe SDK bridge flag changes', () => {
    const params: CowSwapWidgetParams = { appCode: 'test-app' }
    const firstHandler = createWidgetHandler()
    const secondHandler = createWidgetHandler()
    createCowSwapWidgetMock.mockReturnValueOnce(firstHandler).mockReturnValueOnce(secondHandler)

    const { rerender } = render(<CowSwapWidget params={params} enableSafeSdkBridge />)

    rerender(<CowSwapWidget params={params} enableSafeSdkBridge={false} />)

    expect(firstHandler.destroy).toHaveBeenCalledTimes(1)
    expect(firstHandler.updateParams).not.toHaveBeenCalled()
    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(2)
    expect(createCowSwapWidgetMock.mock.calls[1]?.[1].enableSafeSdkBridge).toBe(false)
  })

  it('keeps the widget handler in handlerRef while the widget exists', () => {
    const handler = createWidgetHandler()
    const handlerRef: { current: CowSwapWidgetHandler | null } = { current: null }
    createCowSwapWidgetMock.mockReturnValueOnce(handler)

    const { unmount } = render(<CowSwapWidget params={{ appCode: 'test-app' }} handlerRef={handlerRef} />)

    expect(handlerRef.current).toBe(handler)

    unmount()

    expect(handler.destroy).toHaveBeenCalledTimes(1)
    expect(handlerRef.current).toBeNull()
  })

  it('moves the widget handler to a handlerRef supplied after mount without recreating the widget', () => {
    const params: CowSwapWidgetParams = { appCode: 'test-app' }
    const handler = createWidgetHandler()
    const firstRef: { current: CowSwapWidgetHandler | null } = { current: null }
    const secondRef: { current: CowSwapWidgetHandler | null } = { current: null }
    createCowSwapWidgetMock.mockReturnValueOnce(handler)

    const { rerender } = render(<CowSwapWidget params={params} />)
    rerender(<CowSwapWidget params={params} handlerRef={firstRef} />)

    expect(firstRef.current).toBe(handler)

    rerender(<CowSwapWidget params={params} handlerRef={secondRef} />)

    expect(secondRef.current).toBe(handler)
    expect(firstRef.current).toBeNull()
    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(1)
  })

  it('destroys the widget once and clears handlerRef when an update fails, and recovers on the next params', () => {
    const handler = createWidgetHandler()
    const recoveredHandler = createWidgetHandler()
    const handlerRef: { current: CowSwapWidgetHandler | null } = { current: null }
    jest.mocked(handler.updateParams).mockImplementation(() => {
      throw new Error('update failed')
    })
    createCowSwapWidgetMock.mockReturnValueOnce(handler).mockReturnValueOnce(recoveredHandler)

    const { rerender, getByText } = render(<CowSwapWidget params={{ appCode: 'a' }} handlerRef={handlerRef} />)
    rerender(<CowSwapWidget params={{ appCode: 'b' }} handlerRef={handlerRef} />)

    expect(getByText('Error updating the widget')).toBeTruthy()
    expect(handler.destroy).toHaveBeenCalledTimes(1)
    expect(handlerRef.current).toBeNull()

    rerender(<CowSwapWidget params={{ appCode: 'c' }} handlerRef={handlerRef} />)

    expect(handlerRef.current).toBe(recoveredHandler)
    expect(createCowSwapWidgetMock.mock.calls[1]?.[1].params).toEqual({ appCode: 'c' })
    expect(handler.destroy).toHaveBeenCalledTimes(1)
  })

  it('does not destroy a handler twice when recreating the widget fails', () => {
    const handler = createWidgetHandler()
    createCowSwapWidgetMock.mockReturnValueOnce(handler).mockImplementationOnce(() => {
      throw new Error('create failed')
    })

    const { rerender } = render(<CowSwapWidget params={{ appCode: 'a' }} enableSafeSdkBridge />)
    rerender(<CowSwapWidget params={{ appCode: 'a' }} enableSafeSdkBridge={false} />)

    expect(handler.destroy).toHaveBeenCalledTimes(1)
  })

  it('calls onLoadingError when the widget cannot be created', () => {
    const onLoadingError = jest.fn()
    createCowSwapWidgetMock.mockImplementation(() => {
      throw new Error('Iframe does not contain a window!')
    })

    render(<CowSwapWidget params={{ appCode: 'test-app' }} onLoadingError={onLoadingError} />)

    expect(onLoadingError).toHaveBeenCalledTimes(1)
  })

  it('forwards onLoadingError to the widget recreated for a new provider', () => {
    const onLoadingError = jest.fn()
    const params: CowSwapWidgetParams = { appCode: 'a' }

    const { rerender } = render(<CowSwapWidget params={params} onLoadingError={onLoadingError} />)
    rerender(<CowSwapWidget params={params} provider={createProvider()} onLoadingError={onLoadingError} />)

    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(2)
    expect(createCowSwapWidgetMock.mock.calls[1]?.[1].onLoadingError).toBe(onLoadingError)
  })

  it('recreates the widget once with the new provider when the provider and bridge flag change together', () => {
    const params: CowSwapWidgetParams = { appCode: 'a' }
    const nextProvider = createProvider()

    const { rerender } = render(<CowSwapWidget params={params} provider={createProvider()} enableSafeSdkBridge />)
    rerender(<CowSwapWidget params={params} provider={nextProvider} enableSafeSdkBridge={false} />)

    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(2)
    expect(createCowSwapWidgetMock.mock.calls[1]?.[1].provider).toBe(nextProvider)
  })
})

describe('CowSwapWidget recovery after a failed creation', () => {
  beforeEach(() => {
    createCowSwapWidgetMock.mockReset()
    createCowSwapWidgetMock.mockImplementation(createWidgetHandler)
  })

  it('retries a failed creation only when the settings change', () => {
    createCowSwapWidgetMock.mockImplementationOnce(() => {
      throw new Error('create failed')
    })

    const { rerender } = render(<CowSwapWidget params={{ appCode: 'a' }} />)
    rerender(<CowSwapWidget params={{ appCode: 'a' }} />)
    rerender(<CowSwapWidget params={{ appCode: 'a' }} />)

    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(1)

    rerender(<CowSwapWidget params={{ appCode: 'b' }} />)

    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(2)
    expect(createCowSwapWidgetMock.mock.calls[1]?.[1].params).toEqual({ appCode: 'b' })
  })

  it('does not retry when onLoadingError rerenders the parent with equivalent inline params', () => {
    createCowSwapWidgetMock.mockImplementation(() => {
      throw new Error('create failed')
    })

    function Parent(): JSX.Element {
      const [, setFailures] = useState(0)

      return <CowSwapWidget params={{ appCode: 'a' }} onLoadingError={() => setFailures((n) => n + 1)} />
    }

    render(<Parent />)

    expect(createCowSwapWidgetMock).toHaveBeenCalledTimes(1)
  })
})

function createProvider(): EthereumProvider {
  return { on: jest.fn(), request: jest.fn() }
}

function createWidgetHandler(): CowSwapWidgetHandler {
  return {
    iframe: document.createElement('iframe'),
    updateParams: jest.fn(),
    updateListeners: jest.fn(),
    updateProvider: jest.fn(),
    closeAllModals: jest.fn(),
    destroy: jest.fn(),
  }
}
