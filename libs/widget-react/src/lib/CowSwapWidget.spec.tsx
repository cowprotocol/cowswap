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
})

function createWidgetHandler(): CowSwapWidgetHandler {
  return {
    iframe: document.createElement('iframe'),
    updateParams: jest.fn(),
    updateListeners: jest.fn(),
    updateProvider: jest.fn(),
    destroy: jest.fn(),
  }
}
