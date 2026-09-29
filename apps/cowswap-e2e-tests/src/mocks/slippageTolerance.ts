import type { BrowserContext, Route } from '@playwright/test'

/**
 * Mocks `CoWBFFClient.getSlippageTolerance()` (`:chainId/markets/:pair/slippageTolerance`,
 * matched by path only — same reasoning as `mocks/usdPrices.ts` — `REACT_APP_BFF_BASE_URL` can
 * point at a local proxy instead of the real `bff(.barn).cow.fi` host). Left unmocked, this hits
 * the real, live endpoint: a genuinely variable value (or a timeout, since the client's own fetch
 * aborts after 2s) that feeds `useQuoteParams`'s `hasSmartSlippage` flag — `typeof
 * smartSlippageBpsRef.current === 'number'`, `null` on any failure — and
 * `quoteUsingSameParameters` skips comparing `slippageBps` only when that flag is (stably) `true`.
 * A real value that flips between a number and `null` across polls, purely from live network
 * variance, makes the bridging quote's own params-changed check fire on every poll — the swap
 * never settles, keeping "Price impact unknown" (and the primary CTA) disabled indefinitely. See
 * [CS-287]/[CS-311] for the observed failures this caused.
 */
export interface SlippageToleranceMock {
  /** Overrides the fixed default (0 bps) served for every pair. */
  setSlippageBps(bps: number): void
  reset(): void
}

const DEFAULT_SLIPPAGE_BPS = 0

export function installSlippageTolerance(context: BrowserContext): SlippageToleranceMock {
  let slippageBps = DEFAULT_SLIPPAGE_BPS

  void context.route(/\/\d+\/markets\/[^/]+\/slippageTolerance$/i, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ slippageBps }),
    })
  })

  return {
    setSlippageBps(bps) {
      slippageBps = bps
    },
    reset() {
      slippageBps = DEFAULT_SLIPPAGE_BPS
    },
  }
}
