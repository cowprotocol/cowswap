import { CowSwapWidgetHandler, createCowSwapWidget } from './cowSwapWidget'
import { CowSwapWidgetParams, TradeType } from './types'

describe('createCowSwapWidget', () => {
  const originalOpen = window.open

  beforeEach(() => {
    window.open = jest.fn()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    window.open = originalOpen
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
  })
}

function dispatchInterceptWindowOpen(href: string, origin = 'https://swap.cow.fi', iframe: HTMLIFrameElement): void {
  const event = new MessageEvent('message', {
    origin,
    source: iframe.contentWindow,
    data: {
      key: 'cowSwapWidget',
      method: 'INTERCEPT_WINDOW_OPEN',
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
