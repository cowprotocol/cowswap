/**
 * @jest-environment jsdom
 */

import { CowSwapWidgetHandler, createCowSwapWidget } from './cowSwapWidget'
import { CowSwapWidgetParams, TradeType, WidgetMethodsEmit } from './types'
import { widgetIframeTransport } from './widgetIframeTransport'

const widgetHandlers: CowSwapWidgetHandler[] = []

describe('createCowSwapWidget', () => {
  const originalOpen = window.open

  beforeEach(() => {
    document.body.innerHTML = ''
    window.open = jest.fn()
  })

  afterEach(() => {
    widgetHandlers.splice(0).forEach((handler) => handler.destroy())
    document.body.innerHTML = ''
    window.open = originalOpen
    jest.restoreAllMocks()
  })

  it('updates iframe width and default height when params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        iframeStyle: {
          width: '100%',
          height: '640px',
          backgroundColor: 'red',
          borderRadius: '1.6rem',
        },
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    expect(iframe.style.width).toBe('100%')
    expect(iframe.style.height).toBe('640px')
    expect(iframe.style.backgroundColor).toBe('red')
    expect(iframe.style.borderRadius).toBe('1.6rem')

    handler.updateParams({
      appCode: 'widget-test',
      iframeStyle: {
        width: '320px',
        height: '432px',
        backgroundColor: 'transparent',
        borderRadius: '0',
      },
    })

    expect(iframe.style.width).toBe('320px')
    expect(iframe.style.height).toBe('432px')
    expect(iframe.style.backgroundColor).toBe('transparent')
    expect(iframe.style.borderRadius).toBe('0')
  })

  it('applies iframeStyle to the iframe', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          iframeStyle: { backgroundColor: 'blue', margin: '12px', border: '2px solid green' },
        },
      }),
    )

    const iframe = getIframe(container)

    expect(iframe.style.backgroundColor).toBe('blue')
    expect(iframe.style.margin).toBe('12px')
    expect(iframe.style.border).toBe('2px solid green')
  })

  it('updates the dynamic height css variable on resize events', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        iframeStyle: { height: '640px' },
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(iframe.style.getPropertyValue('--dynamicHeight')).toBe('400px')

    handler.updateParams({
      appCode: 'widget-test',
      iframeStyle: { height: '432px', maxHeight: '350px' },
    })

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })
    expect(iframe.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(iframe.style.height).toBe('432px')
    expect(iframe.style.maxHeight).toBe('350px')

    emitWidgetEvent(iframe, WidgetMethodsEmit.SET_FULL_HEIGHT, {})
    expect(iframe.style.getPropertyValue('--dynamicHeight')).toBe('100dvh')
  })

  it('applies deprecated width and height on create and updateParams', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        width: '100%',
        height: '640px',
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    expect(iframe.width).toBe('100%')
    expect(iframe.height).toBe('640px')

    handler.updateParams({
      appCode: 'widget-test',
      width: '320px',
      height: '432px',
    })

    expect(iframe.width).toBe('320px')
    expect(iframe.height).toBe('432px')
    warnSpy.mockRestore()
  })

  it('applies deprecated maxHeight on the iframe without clamping dynamic height', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        iframeStyle: { height: 'var(--dynamicHeight)' },
        maxHeight: 400,
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })

    expect(iframe.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(iframe.style.maxHeight).toBe('400px')
  })

  it('warns when deprecated width conflicts with iframeStyle.width', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          width: '100%',
          iframeStyle: { width: '320px' },
        },
      }),
    )

    const iframe = getIframe(container)

    expect(warnSpy).toHaveBeenCalledWith('Both iframeStyle.width and width params have been set. width will be ignored')
    expect(iframe.style.width).toBe('320px')

    warnSpy.mockRestore()
  })

  it('opens https links requested by the widget', () => {
    const { iframe } = createWidget()

    dispatchInterceptWindowOpen('https://example.com', undefined, iframe)

    expect(window.open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener')
  })

  it('blocks javascript urls requested by the widget', () => {
    const { iframe } = createWidget()

    dispatchInterceptWindowOpen('javascript://%0Aalert(1)', undefined, iframe)

    expect(window.open).not.toHaveBeenCalled()
  })

  it('opens relative links requested by the widget', () => {
    const { iframe } = createWidget()

    dispatchInterceptWindowOpen('/faq', undefined, iframe)

    expect(window.open).toHaveBeenCalledWith('https://swap.cow.fi/faq', '_blank', 'noopener')
  })

  it('accepts messages from a custom widget baseUrl origin', () => {
    const { iframe } = createWidget('https://barn.cow.fi')

    dispatchInterceptWindowOpen('https://example.com', 'https://barn.cow.fi', iframe)

    expect(window.open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener')
  })

  it('ignores messages from an untrusted origin', () => {
    const { iframe } = createWidget('https://swap.cow.fi')

    dispatchInterceptWindowOpen('https://example.com', 'https://attacker.example', iframe)

    expect(window.open).not.toHaveBeenCalled()
  })

  it('does not window.open when disableWindowOpen = true', () => {
    const { iframe } = createWidget(undefined, { disableWindowOpen: true })

    dispatchInterceptWindowOpen('https://example.com', undefined, iframe)

    expect(window.open).not.toHaveBeenCalled()
  })

  it('keeps parent widget messages while Safe SDK forwarding is disabled', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => void 0)
    const { iframe } = createWidget(undefined, undefined, false)

    dispatchInterceptWindowOpen('/faq', undefined, iframe)
    dispatchSafeSdkRequest(iframe)

    expect(window.open).toHaveBeenCalledWith('https://swap.cow.fi/faq', '_blank', 'noopener')
    expect(postMessageSpy).not.toHaveBeenCalled()

    postMessageSpy.mockRestore()
  })
})

function getIframe(container: HTMLElement): HTMLIFrameElement {
  const iframe = container.querySelector('iframe')

  if (!iframe) {
    throw new Error('Expected iframe to be created')
  }

  return iframe
}

function emitWidgetEvent(iframe: HTMLIFrameElement, method: WidgetMethodsEmit, payload: object): void {
  const origin = new URL(iframe.src).origin
  const event = new MessageEvent('message', {
    origin,
    data: {
      key: widgetIframeTransport.key,
      method,
      ...payload,
    },
  })

  Object.defineProperty(event, 'source', {
    configurable: true,
    value: iframe.contentWindow,
  })

  window.dispatchEvent(event)
}

function createWidget(
  baseUrl?: string,
  extraParams?: Partial<CowSwapWidgetParams>,
  enableSafeSdkBridge?: boolean,
): CowSwapWidgetHandler {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const widgetHandler = createCowSwapWidget(container, {
    params: {
      appCode: 'test-app',
      baseUrl,
      chainId: 1,
      tradeType: TradeType.SWAP,
      ...extraParams,
    },
    enableSafeSdkBridge,
  })

  widgetHandlers.push(widgetHandler)

  return widgetHandler
}

function dispatchInterceptWindowOpen(href: string, origin = 'https://swap.cow.fi', iframe: HTMLIFrameElement): void {
  const event = new MessageEvent('message', {
    origin,
    source: iframe.contentWindow,
    data: {
      key: widgetIframeTransport.key,
      method: WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN,
      href,
      target: '_blank',
      rel: 'noopener',
    },
  })

  Object.defineProperty(event, 'source', {
    configurable: true,
    value: iframe.contentWindow,
  })

  window.dispatchEvent(event)
}

function dispatchSafeSdkRequest(iframe: HTMLIFrameElement): void {
  const event = new MessageEvent('message', {
    origin: 'https://swap.cow.fi',
    source: iframe.contentWindow,
    data: {
      id: 'safe-request-id',
      method: 'getSafeInfo',
      params: {},
      env: {
        sdkVersion: '1.0.0',
      },
    },
  })

  Object.defineProperty(event, 'source', {
    configurable: true,
    value: iframe.contentWindow,
  })

  window.dispatchEvent(event)
}
