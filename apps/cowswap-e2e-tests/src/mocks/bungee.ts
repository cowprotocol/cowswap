import type { BrowserContext, Route } from '@playwright/test'

export interface BungeeMock {
  stubRoute(opts: { sellAmount: string; buyAmount: string; estTimeSec: number }): void
  reset(): void
}

export function installBungee(context: BrowserContext): BungeeMock {
  let next = { sellAmount: '1000000', buyAmount: '999000', estTimeSec: 180 }

  void context.route(/(?:api\.bungee|api\.socket)\..*/i, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        result: {
          routes: [{ sellAmount: next.sellAmount, buyAmount: next.buyAmount, estimatedTimeSeconds: next.estTimeSec }],
        },
      }),
    })
  })

  return {
    stubRoute(opts) {
      next = opts
    },
    reset() {
      next = { sellAmount: '1000000', buyAmount: '999000', estTimeSec: 180 }
    },
  }
}
