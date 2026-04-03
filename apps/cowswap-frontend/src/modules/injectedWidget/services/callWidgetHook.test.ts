import { isInjectedWidget } from '@cowprotocol/common-utils'
import { WidgetHookEvents, widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'
import type { WidgetMethodsEmitPayloadMap } from '@cowprotocol/widget-lib'

import { callWidgetHook } from './callWidgetHook'

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('@cowprotocol/widget-lib', () => ({
  WidgetHookEvents: {
    ON_BEFORE_TRADE: 'ON_BEFORE_TRADE',
  },
  WidgetMethodsEmit: {
    PROCESS_HOOK: 'PROCESS_HOOK',
  },
  WidgetMethodsListen: {
    HOOK_RESULT: 'HOOK_RESULT',
  },
  widgetIframeTransport: {
    listenToMessageFromWindow: jest.fn(),
    postMessageToWindow: jest.fn(),
  },
}))

const mockIsInjectedWidget = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const mockListenToMessageFromWindow = widgetIframeTransport.listenToMessageFromWindow as jest.MockedFunction<
  typeof widgetIframeTransport.listenToMessageFromWindow
>
const mockPostMessageToWindow = widgetIframeTransport.postMessageToWindow as jest.MockedFunction<
  typeof widgetIframeTransport.postMessageToWindow
>
const hookResultListener = mockListenToMessageFromWindow.mock.calls[0][2] as (payload: {
  id: string
  result: boolean
}) => void

describe('callWidgetHook', () => {
  beforeEach(() => {
    mockIsInjectedWidget.mockReset()
    mockPostMessageToWindow.mockClear()
    mockIsInjectedWidget.mockReturnValue(true)
    window.history.replaceState({}, '', '/')
  })

  it('returns true without posting when hooksEnabled is absent', async () => {
    const result = await callWidgetHook(WidgetHookEvents.ON_BEFORE_TRADE, {} as never)

    expect(result).toBe(true)
    expect(mockPostMessageToWindow).not.toHaveBeenCalled()
  })

  it('posts PROCESS_HOOK when hooksEnabled=true', async () => {
    window.history.replaceState({}, '', '/?hooksEnabled=true')

    const hookCall = callWidgetHook(WidgetHookEvents.ON_BEFORE_TRADE, {} as never)

    expect(mockPostMessageToWindow).toHaveBeenCalledWith(
      window.parent,
      WidgetMethodsEmit.PROCESS_HOOK,
      expect.objectContaining({
        event: WidgetHookEvents.ON_BEFORE_TRADE,
        payload: {},
      }),
    )

    const [, , payload] = mockPostMessageToWindow.mock.calls[0] as [
      WindowProxy,
      WidgetMethodsEmit.PROCESS_HOOK,
      WidgetMethodsEmitPayloadMap[WidgetMethodsEmit.PROCESS_HOOK],
    ]
    hookResultListener({ id: payload.id, result: true })

    await expect(hookCall).resolves.toBe(true)
  })
})
