import type { BrowserContext, Route } from '@playwright/test'

export interface NearIntentsMock {
  stubRoute(opts: { sellAmount: string; buyAmount: string; estTimeSec: number }): void
  reset(): void
}

export function installNearIntents(context: BrowserContext): NearIntentsMock {
  let next = { sellAmount: '1000000', buyAmount: '999000', estTimeSec: 240 }

  void context.route(/(?:api\.near-intents|near-intents\.org)/i, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        intent: {
          sellAmount: next.sellAmount,
          buyAmount: next.buyAmount,
          estimatedTimeSeconds: next.estTimeSec,
          provider: 'near',
        },
      }),
    })
  })

  return {
    stubRoute(opts) {
      next = opts
    },
    reset() {
      next = { sellAmount: '1000000', buyAmount: '999000', estTimeSec: 240 }
    },
  }
}
