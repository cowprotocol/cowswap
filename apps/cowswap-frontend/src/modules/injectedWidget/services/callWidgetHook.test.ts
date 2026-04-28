import { isInjectedWidget } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { WidgetHookEvents, widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'
import type { WidgetMethodsEmitPayloadMap } from '@cowprotocol/widget-lib'

import { callWidgetHook } from './callWidgetHook'

import { injectedWidgetHooksEnabledAtom } from '../state/injectedWidgetHooksEnabledAtom'

jest.mock('@cowprotocol/common-utils', () => ({
  isInjectedWidget: jest.fn(),
}))

jest.mock('@cowprotocol/core', () => ({
  jotaiStore: {
    get: jest.fn(),
  },
}))

jest.mock('@cowprotocol/iframe-transport', () => ({
  getParentOrigin: jest.fn(),
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
const mockJotaiGet = jotaiStore.get as jest.MockedFunction<typeof jotaiStore.get>
const mockListenToMessageFromWindow = widgetIframeTransport.listenToMessageFromWindow as jest.MockedFunction<
  typeof widgetIframeTransport.listenToMessageFromWindow
>
const mockPostMessageToWindow = widgetIframeTransport.postMessageToWindow as jest.MockedFunction<
  typeof widgetIframeTransport.postMessageToWindow
>
const mockGetParentOrigin = getParentOrigin as jest.MockedFunction<typeof getParentOrigin>

describe('callWidgetHook', () => {
  beforeEach(() => {
    mockIsInjectedWidget.mockReset()
    mockJotaiGet.mockReset()
    mockListenToMessageFromWindow.mockReset()
    mockPostMessageToWindow.mockClear()
    mockGetParentOrigin.mockReset()
    mockIsInjectedWidget.mockReturnValue(true)
    mockGetParentOrigin.mockReturnValue('http://localhost')
    mockJotaiGet.mockImplementation((atom) => (atom === injectedWidgetHooksEnabledAtom ? false : undefined))
  })

  it('returns true without posting when hooksEnabled is absent', async () => {
    const result = await callWidgetHook(WidgetHookEvents.ON_BEFORE_TRADE, {} as never)

    expect(result).toBe(true)
    expect(mockPostMessageToWindow).not.toHaveBeenCalled()
  })

  it('posts PROCESS_HOOK when hooksEnabled=true', async () => {
    mockJotaiGet.mockImplementation((atom) => (atom === injectedWidgetHooksEnabledAtom ? true : undefined))

    const hookCall = callWidgetHook(WidgetHookEvents.ON_BEFORE_TRADE, {} as never)

    expect(mockListenToMessageFromWindow).toHaveBeenCalledWith(
      window,
      expect.any(Window),
      'HOOK_RESULT',
      expect.any(Function),
      'http://localhost',
    )

    expect(mockPostMessageToWindow).toHaveBeenCalledWith(
      window.parent,
      WidgetMethodsEmit.PROCESS_HOOK,
      expect.objectContaining({
        event: WidgetHookEvents.ON_BEFORE_TRADE,
        payload: {},
      }),
      'http://localhost',
    )

    const hookResultListener = mockListenToMessageFromWindow.mock.calls[0][3] as (payload: {
      id: string
      result: boolean
    }) => void
    const [, , payload] = mockPostMessageToWindow.mock.calls[0] as [
      WindowProxy,
      WidgetMethodsEmit.PROCESS_HOOK,
      WidgetMethodsEmitPayloadMap[WidgetMethodsEmit.PROCESS_HOOK],
    ]
    hookResultListener({ id: payload.id, result: true })

    await expect(hookCall).resolves.toBe(true)
  })
})
