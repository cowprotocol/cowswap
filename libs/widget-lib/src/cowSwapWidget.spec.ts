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

    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener')
  })

  it('blocks javascript urls requested by the widget', () => {
    createWidget()

    dispatchInterceptWindowOpen('javascript://%0Aalert(1)')

    expect(window.open).not.toHaveBeenCalled()
  })

  it('opens relative links requested by the widget', () => {
    createWidget()

    dispatchInterceptWindowOpen('/faq')

    expect(window.open).toHaveBeenCalledWith('/faq', '_blank', 'noopener')
  })
})

function createWidget(): void {
  const container = document.createElement('div')
  document.body.appendChild(container)

  createCowSwapWidget(container, {
    params: {
      appCode: 'test-app',
      chainId: 1,
      tradeType: TradeType.SWAP,
    },
  })
}

function dispatchInterceptWindowOpen(href: string): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: 'https://swap.cow.fi',
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
