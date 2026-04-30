import { getParentOrigin } from '@cowprotocol/iframe-transport'

import {
  cacheWidgetMessage,
  clearCachedWidgetMessages,
  registerCachedMessageHandler,
  replayCachedWidgetMessage,
  unregisterCachedMessageHandler,
} from './widgetMessagesCache.utils'

jest.mock('@cowprotocol/iframe-transport', () => ({
  ...jest.requireActual('@cowprotocol/iframe-transport'),
  getParentOrigin: jest.fn(),
}))

const TRUSTED_ORIGIN = 'https://widget-configurator.example'

describe('widgetMessagesCache utils', () => {
  beforeEach(() => {
    clearCachedWidgetMessages()
    ;(getParentOrigin as jest.Mock).mockReturnValue(TRUSTED_ORIGIN)
  })

  afterEach(() => {
    unregisterCachedMessageHandler('UPDATE_PARAMS')
    jest.restoreAllMocks()
  })

  it('calls the registered handler directly with cached message data', () => {
    const handler = jest.fn()
    const eventData = {
      key: 'cowSwapWidget',
      method: 'UPDATE_PARAMS',
      urlParams: { pathname: '/1/widget/swap', search: '' },
      appParams: {},
      hasProvider: false,
    }

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: TRUSTED_ORIGIN,
        source: window, // window.parent === window in jsdom
        data: eventData,
      }),
    )

    registerCachedMessageHandler('UPDATE_PARAMS', handler)
    replayCachedWidgetMessage('UPDATE_PARAMS')

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(eventData)
  })

  it('does nothing if no handler is registered for the method', () => {
    const eventData = {
      key: 'cowSwapWidget',
      method: 'UPDATE_PARAMS',
      urlParams: { pathname: '/1/widget/swap', search: '' },
      appParams: {},
      hasProvider: false,
    }

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: TRUSTED_ORIGIN,
        source: window,
        data: eventData,
      }),
    )

    expect(() => replayCachedWidgetMessage('UPDATE_PARAMS')).not.toThrow()
  })

  it('ignores messages with untrusted origin', () => {
    const handler = jest.fn()

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: 'https://evil.example',
        source: window,
        data: { key: 'cowSwapWidget', method: 'UPDATE_PARAMS' },
      }),
    )

    registerCachedMessageHandler('UPDATE_PARAMS', handler)
    replayCachedWidgetMessage('UPDATE_PARAMS')

    expect(handler).not.toHaveBeenCalled()
  })

  it('ignores non-widget messages', () => {
    const handler = jest.fn()

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: TRUSTED_ORIGIN,
        source: window,
        data: { key: 'different-key', method: 'UPDATE_PARAMS' },
      }),
    )

    registerCachedMessageHandler('UPDATE_PARAMS', handler)
    replayCachedWidgetMessage('UPDATE_PARAMS')

    expect(handler).not.toHaveBeenCalled()
  })
})
