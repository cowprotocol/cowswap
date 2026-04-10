import { createCowSwapWidget } from './cowSwapWidget'
import { TradeType } from './types'

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
    createWidget()

    dispatchInterceptWindowOpen('https://example.com')

    expect(window.open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener')
  })

  it('blocks javascript urls requested by the widget', () => {
    createWidget()

    dispatchInterceptWindowOpen('javascript://%0Aalert(1)')

    expect(window.open).not.toHaveBeenCalled()
  })

  it('opens relative links requested by the widget', () => {
    createWidget()

    dispatchInterceptWindowOpen('/faq')

    expect(window.open).toHaveBeenCalledWith('https://swap.cow.fi/faq', '_blank', 'noopener')
  })

  it('accepts messages from a custom widget baseUrl origin', () => {
    createWidget('https://barn.cow.fi')

    dispatchInterceptWindowOpen('https://example.com', 'https://barn.cow.fi')

    expect(window.open).toHaveBeenCalledWith('https://example.com/', '_blank', 'noopener')
  })

  it('ignores messages from an untrusted origin', () => {
    createWidget('https://swap.cow.fi')

    dispatchInterceptWindowOpen('https://example.com', 'https://attacker.example')

    expect(window.open).not.toHaveBeenCalled()
  })
})

function createWidget(baseUrl?: string): void {
  const container = document.createElement('div')
  document.body.appendChild(container)

  createCowSwapWidget(container, {
    params: {
      appCode: 'test-app',
      baseUrl,
      chainId: 1,
      tradeType: TradeType.SWAP,
    },
  })
}

function dispatchInterceptWindowOpen(href: string, origin = 'https://swap.cow.fi'): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin,
      data: {
        key: 'cowSwapWidget',
        method: 'INTERCEPT_WINDOW_OPEN',
        href,
        target: '_blank',
        rel: 'noopener',
      },
    }),
  )
}
