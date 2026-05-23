import type { BrowserContext, Route } from '@playwright/test'

export interface BffMock {
  stubQuote(opts: { sellAmount: string; buyAmount: string }): void
  reset(): void
}

export function installBff(context: BrowserContext): BffMock {
  let nextQuote = { sellAmount: '500000000000000000', buyAmount: '1000000000' /* 1 USDC */ }

  void context.route(/\/api\/v1\/quote(\?.*)?$/i, async (route: Route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        quote: {
          sellAmount: nextQuote.sellAmount,
          buyAmount: nextQuote.buyAmount,
          feeAmount: '0',
          validTo: Math.floor(Date.now() / 1000) + 600,
          kind: 'sell',
        },
        from: '0x0000000000000000000000000000000000000000',
      }),
    })
  })

  return {
    stubQuote(opts) {
      nextQuote = opts
    },
    reset() {
      nextQuote = { sellAmount: '500000000000000000', buyAmount: '1000000000' }
    },
  }
}
