import type { BrowserContext, Page, Route } from '@playwright/test'

export interface PostedOrder {
  uid: string
  body: unknown
}

export interface CowOrderApiMock {
  readonly posted: PostedOrder[]
  expectPostOrderOnce(opts?: { status?: 'open' | 'fulfilled' | 'cancelled' }): void
  reset(): Promise<void>
}

export function installCowOrderApi(context: BrowserContext, page: Page): CowOrderApiMock {
  const posted: PostedOrder[] = []
  let nextStatus: 'open' | 'fulfilled' | 'cancelled' = 'open'

  const postOrderHandler = async (route: Route): Promise<void> => {
    const body = route.request().postDataJSON() as unknown
    const uid = `0x${Buffer.from(`${Date.now()}${posted.length}`).toString('hex').padEnd(112, '0')}`
    posted.push({ uid, body })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(uid),
    })
  }

  const getOrderHandler = async (route: Route): Promise<void> => {
    const url = new URL(route.request().url())
    const uid = url.pathname.split('/').pop() ?? ''
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        uid,
        status: nextStatus,
        creationDate: new Date().toISOString(),
        executedSellAmount: '0',
        executedBuyAmount: '0',
      }),
    })
  }

  void context.route(/\/api\/v1\/orders\/?$/, async (route) => {
    if (route.request().method() === 'POST') return postOrderHandler(route)
    return route.fallback()
  })

  void context.route(/\/api\/v1\/orders\/0x[a-f0-9]+$/i, async (route) => {
    if (route.request().method() === 'GET') return getOrderHandler(route)
    return route.fallback()
  })

  return {
    posted,
    expectPostOrderOnce(opts = {}) {
      nextStatus = opts.status ?? 'open'
    },
    async reset() {
      posted.length = 0
      nextStatus = 'open'
      await context.unrouteAll({ behavior: 'wait' })
      void page // page handle reserved for future per-page narrow routes
    },
  }
}
