import type { CowSwapWidgetHandler, CowSwapWidgetParams } from '@cowprotocol/widget-lib'
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

  it('calls onLoadingError when the widget cannot be created', () => {
    const onLoadingError = jest.fn()
    createCowSwapWidgetMock.mockImplementation(() => {
      throw new Error('Iframe does not contain a window!')
    })

    render(<CowSwapWidget params={{ appCode: 'test-app' }} onLoadingError={onLoadingError} />)

    expect(onLoadingError).toHaveBeenCalledTimes(1)
  })
})

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
