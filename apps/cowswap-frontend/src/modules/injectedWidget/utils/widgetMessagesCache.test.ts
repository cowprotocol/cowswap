import { cacheWidgetMessage, clearCachedWidgetMessages, replayCachedWidgetMessage } from './widgetMessagesCache.utils'

describe('widgetMessagesCache utils', () => {
  beforeEach(() => {
    clearCachedWidgetMessages()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('replays cached widget messages with their original origin', () => {
    const messageListener = jest.fn()
    const eventData = {
      key: 'cowSwapWidget',
      method: 'UPDATE_PARAMS',
      urlParams: { pathname: '/1/widget/swap', search: '' },
      appParams: {},
      hasProvider: false,
    }

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: 'https://widget-configurator.example',
        data: eventData,
      }),
    )

    window.addEventListener('message', messageListener)
    replayCachedWidgetMessage('UPDATE_PARAMS')
    window.removeEventListener('message', messageListener)

    expect(messageListener).toHaveBeenCalledTimes(1)

    const replayedEvent = messageListener.mock.calls[0][0] as MessageEvent

    expect(replayedEvent.origin).toBe('https://widget-configurator.example')
    expect(replayedEvent.data).toEqual(eventData)
  })

  it('ignores non-widget messages', () => {
    const messageListener = jest.fn()

    cacheWidgetMessage(
      new MessageEvent('message', {
        origin: 'https://widget-configurator.example',
        data: {
          key: 'different-key',
          method: 'UPDATE_PARAMS',
        },
      }),
    )

    window.addEventListener('message', messageListener)
    replayCachedWidgetMessage('UPDATE_PARAMS')
    window.removeEventListener('message', messageListener)

    expect(messageListener).not.toHaveBeenCalled()
  })
})
