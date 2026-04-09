import { IframeTransport } from './IframeTransport'

interface TestPayloadMap {
  PING: { value: string }
}

describe('IframeTransport', () => {
  const method = 'PING' as const
  const trustedOrigin = 'https://swap.cow.fi'

  function dispatchMessage({ data, origin = trustedOrigin }: { data: unknown; origin?: string }): void {
    window.dispatchEvent(new MessageEvent('message', { data, origin }))
  }

  it('accepts matching messages from the allowed origin', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const callback = jest.fn()

    transport.listenToMessageFromWindow(window, method, callback, trustedOrigin)

    dispatchMessage({
      data: { key: 'test-key', method, value: 'ok' },
    })

    expect(callback).toHaveBeenCalledWith({ key: 'test-key', method, value: 'ok' })
  })

  it('rejects messages from an unexpected origin', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const callback = jest.fn()

    transport.listenToMessageFromWindow(window, method, callback, trustedOrigin)

    dispatchMessage({
      data: { key: 'test-key', method, value: 'blocked' },
      origin: 'https://evil.example',
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('rejects messages with a different transport key', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const callback = jest.fn()

    transport.listenToMessageFromWindow(window, method, callback)

    dispatchMessage({
      data: { key: 'other-key', method, value: 'blocked' },
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('accepts messages from a provided origin override', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const callback = jest.fn()

    transport.listenToMessageFromWindow(window, method, callback, 'https://staging.swap.cow.fi')

    dispatchMessage({
      data: { key: 'test-key', method, value: 'ok' },
      origin: 'https://staging.swap.cow.fi',
    })

    expect(callback).toHaveBeenCalledWith({ key: 'test-key', method, value: 'ok' })
  })

  it('posts to the trusted origin by default', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const postMessage = jest.fn()
    const targetWindow = { postMessage } as unknown as Window

    transport.postMessageToWindow(targetWindow, method, { value: 'ok' })

    expect(postMessage).toHaveBeenCalledWith({ key: 'test-key', method, value: 'ok' }, trustedOrigin)
  })

  it('posts to the provided origin', () => {
    const transport = new IframeTransport<TestPayloadMap>('test-key')
    const postMessage = jest.fn()
    const targetWindow = { postMessage } as unknown as Window

    transport.postMessageToWindow(targetWindow, method, { value: 'ok' }, trustedOrigin)

    expect(postMessage).toHaveBeenCalledWith({ key: 'test-key', method, value: 'ok' }, trustedOrigin)
  })
})
