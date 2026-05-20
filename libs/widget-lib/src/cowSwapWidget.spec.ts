/**
 * @jest-environment jsdom
 */

import { CowSwapWidgetHandler, createCowSwapWidget } from './cowSwapWidget'
import { CowSwapWidgetParams, TradeType, WidgetMethodsEmit } from './types'
import { widgetIframeTransport } from './widgetIframeTransport'

describe('createCowSwapWidget', () => {
  const originalOpen = window.open

  beforeEach(() => {
    document.body.innerHTML = ''
    window.open = jest.fn()
  })

  afterEach(() => {
    window.open = originalOpen
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

    createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        iframeStyle: { backgroundColor: 'blue', margin: '12px', border: '2px solid green' },
      },
    })

    const iframe = getIframe(container)

    expect(iframe.style.backgroundColor).toBe('blue')
    expect(iframe.style.margin).toBe('12px')
    expect(iframe.style.border).toBe('2px solid green')
  })

  it('uses the latest height config for resize events after params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        height: '640px',
      },
    })

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(iframe.style.height).toBe('400px')

    handler.updateParams({
      appCode: 'widget-test',
      height: '432px',
      maxHeight: 350,
    })

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(iframe.style.height).toBe('350px')

    emitWidgetEvent(iframe, WidgetMethodsEmit.SET_FULL_HEIGHT, { isUpToSmall: true })
    expect(iframe.style.height).toBe('432px')

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 900,
    })

    emitWidgetEvent(iframe, WidgetMethodsEmit.SET_FULL_HEIGHT, { isUpToSmall: false })
    expect(iframe.style.height).toBe('350px')
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

function createWidget(baseUrl?: string, extraParams?: Partial<CowSwapWidgetParams>): CowSwapWidgetHandler {
  const container = document.createElement('div')
  document.body.appendChild(container)

  return createCowSwapWidget(container, {
    params: {
      appCode: 'test-app',
      baseUrl,
      chainId: 1,
      tradeType: TradeType.SWAP,
      ...extraParams,
    },
  })
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
