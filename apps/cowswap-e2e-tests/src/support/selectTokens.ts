import type { SwapPage } from '../pages/SwapPage'

/**
 * Picks `sell`/`buy` tokens via the real dropdown UI (`searchAndPick` already handles the
 * "already selected" duplicate-currency-guard no-op, see `TokenSelector`).
 *
 * Not a fit for every test: when a token needs an amount typed into the sell field *before* it's
 * selected (working around `useSetupTradeAmountsFromUrl`'s 1-unit auto-fill race, see [MO-11]),
 * that ordering has to stay inline instead of going through this helper.
 */
export async function selectTokens(swapPage: SwapPage, sell: string, buy: string): Promise<void> {
  await swapPage.tokens.openInput()
  await swapPage.tokens.searchAndPick(sell)
  await swapPage.tokens.openOutput()
  await swapPage.tokens.searchAndPick(buy)
}
