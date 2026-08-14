import type { BrowserContext, Route } from '@playwright/test'

/**
 * Stubs the Tenderly bundle-simulation endpoint (`bundleSimulation.ts`'s `simulateBundle`, hit at
 * `{BFF_BASE_URL}/{chainId}/simulation/simulateBundle`) that `useTenderlyBundleSimulation` POSTs to
 * once the trade-confirmation screen mounts with at least one hook attached. Real endpoint, never
 * mocked before this — `HookItem` renders "Simulation successful"/"Simulation failed" straight off
 * each response entry's `status` boolean, positionally matched to the posted pre/post hooks.
 */
export async function mockHooksSimulation(context: BrowserContext, opts: { status?: boolean } = {}): Promise<void> {
  const status = opts.status ?? true

  await context.route(/bff\.(?:barn\.)?cow\.fi\/\d+\/simulation\/simulateBundle/i, async (route: Route) => {
    const postedHooks = JSON.parse(route.request().postData() || '[]') as unknown[]
    const body = postedHooks.map((_, index) => ({
      link: `https://dashboard.tenderly.co/mock-simulation-${index}`,
      status,
      id: `mock-simulation-${index}`,
      cumulativeBalancesDiff: {},
      stateDiff: [],
      gasUsed: '21000',
    }))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}
