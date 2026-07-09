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

  it('updates container width and default height when params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: {
          width: '100%',
          height: '640px',
          backgroundColor: 'red',
          borderRadius: '1.6rem',
        },
      },
    })
    widgetHandlers.push(handler)

    expect(container.style.width).toBe('100%')
    expect(container.style.height).toBe('640px')
    expect(container.style.backgroundColor).toBe('red')
    expect(container.style.borderRadius).toBe('1.6rem')

    handler.updateParams({
      appCode: 'widget-test',
      rootStyle: {
        width: '320px',
        height: '432px',
        backgroundColor: 'transparent',
        borderRadius: '0',
      },
    })

    expect(container.style.width).toBe('320px')
    expect(container.style.height).toBe('432px')
    expect(container.style.backgroundColor).toBe('transparent')
    expect(container.style.borderRadius).toBe('0')
  })

  it('applies rootStyle to the container and makes the iframe fill it', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          rootStyle: { backgroundColor: 'blue', margin: '12px', border: '2px solid green' },
        },
      }),
    )

    expect(container.style.backgroundColor).toBe('blue')
    expect(container.style.margin).toBe('12px')
    expect(container.style.border).toBe('2px solid green')

    const iframe = getIframe(container)
    expect(iframe.style.width).toBe('100%')
    expect(iframe.style.height).toBe('100%')
  })

  it('updates the dynamic height css variable on resize events', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: { height: '640px' },
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('400px')

    handler.updateParams({
      appCode: 'widget-test',
      rootStyle: { height: '432px', maxHeight: '350px' },
    })

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(container.style.height).toBe('432px')
    expect(container.style.maxHeight).toBe('350px')

    emitWidgetEvent(iframe, WidgetMethodsEmit.SET_FULL_HEIGHT, {})
    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('100dvh')
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

    expect(container.style.width).toBe('100%')
    expect(container.style.height).toBe('640px')

    handler.updateParams({
      appCode: 'widget-test',
      width: '320px',
      height: '432px',
    })

    expect(container.style.width).toBe('320px')
    expect(container.style.height).toBe('432px')
    warnSpy.mockRestore()
  })

  it('applies deprecated maxHeight on the container without clamping dynamic height', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        rootStyle: { height: 'var(--dynamicHeight)' },
        maxHeight: 400,
      },
    })
    widgetHandlers.push(handler)

    const iframe = getIframe(container)

    emitWidgetEvent(iframe, WidgetMethodsEmit.UPDATE_HEIGHT, { height: 500 })

    expect(container.style.getPropertyValue('--dynamicHeight')).toBe('500px')
    expect(container.style.maxHeight).toBe('400px')
  })

  it('warns when deprecated width conflicts with rootStyle.width', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          width: '100%',
          rootStyle: { width: '320px' },
        },
      }),
    )

    expect(warnSpy).toHaveBeenCalledWith(
      'Both params.width and rootStyle.width have been set. params.width will be ignored.',
    )
    expect(container.style.width).toBe('320px')

    warnSpy.mockRestore()
  })

  it('warns when deprecated theme.boxShadow is used', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          theme: {
            baseTheme: 'light',
            primary: '#052b65',
            background: '#FFFFFF',
            paper: '#FFFFFF',
            text: '#052B65',
            danger: '#D41300',
            warning: '#F8D06B',
            alert: '#DB971E',
            info: '#0d5ed9',
            success: '#007B28',
            boxShadow: 'none',
          },
        },
      }),
    )

    expect(warnSpy).toHaveBeenCalledWith('params.theme.boxShadow is deprecated. Use cardStyle.boxShadow instead.')

    warnSpy.mockRestore()
  })

  it('warns when deprecated theme.boxShadow conflicts with cardStyle.boxShadow', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => void 0)
    const container = document.createElement('div')
    document.body.appendChild(container)

    widgetHandlers.push(
      createCowSwapWidget(container, {
        params: {
          appCode: 'widget-test',
          theme: {
            baseTheme: 'light',
            primary: '#052b65',
            background: '#FFFFFF',
            paper: '#FFFFFF',
            text: '#052B65',
            danger: '#D41300',
            warning: '#F8D06B',
            alert: '#DB971E',
            info: '#0d5ed9',
            success: '#007B28',
            boxShadow: 'none',
          },
          cardStyle: { boxShadow: '0 0 32px 0 black' },
        },
      }),
    )

    expect(warnSpy).toHaveBeenCalledWith(
      'Both params.theme.boxShadow and cardStyle.boxShadow have been set. params.theme.boxShadow will be ignored.',
    )
    expect(warnSpy).not.toHaveBeenCalledWith('params.theme.boxShadow is deprecated. Use cardStyle.boxShadow instead.')

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

  it('throws when appCode is omitted', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    expect(() =>
      createCowSwapWidget(container, {
        params: {
          chainId: 1,
          tradeType: TradeType.SWAP,
        } as CowSwapWidgetParams,
      }),
    ).toThrow('Required param `appCode` is missing')

    expect(container.querySelector('iframe')).toBeNull()
  })

  it('throws when appCode is blank on updateParams', () => {
    const { updateParams } = createWidget()

    expect(() => updateParams({ appCode: '   ' } as CowSwapWidgetParams)).toThrow('Required param `appCode` is missing')
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
