import type { BrowserContext } from '@playwright/test'

/**
 * Stubs the BFF's hooks bundle-simulation endpoint (`useTenderlyBundleSimulation`'s
 * `simulateBundle` — `POST <BFF_BASE_URL>/<chainId>/simulation/simulateBundle`), a real
 * Tenderly-backed call that `OrderHooksDetails` fires (via `mutate()`) as soon as
 * `isTradeConfirmation` is true, i.e. the moment a hook is attached and the confirmation screen
 * renders. Answers with one successful `SimulationData` entry per hook in the request body, in the
 * same order the request sent them — `generateNewSimulationData` maps pre-hooks off the front and
 * post-hooks off the back of this array positionally, so the count must match regardless of how
 * many pre/post hooks a given test attaches.
 */
export async function mockHooksSimulation(context: BrowserContext): Promise<void> {
  await context.route(/\/simulation\/simulateBundle$/i, async (route) => {
    const hooks = (route.request().postDataJSON() ?? []) as unknown[]
    const body = hooks.map((_, index) => ({
      link: `https://dashboard.tenderly.co/public/safe/safe-apps/simulator/mocked-${index}`,
      status: true,
      id: `mocked-simulation-${index}`,
      cumulativeBalancesDiff: {},
      stateDiff: [],
      gasUsed: '45000',
    }))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })
}
