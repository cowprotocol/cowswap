import type { RwaAssetSummary, RwaTokenSummary } from '@/entities/asset'
import type { Position } from '@/widgets/account'

/** `/api/v1/assets` accepts up to 100 `tickers` and returns up to 100 items */
export const MAX_PORTFOLIO_MARKETS = 100

export function getHeldTickersKey(
  positions: Position[] | null,
  getAsset: (token: RwaTokenSummary) => RwaAssetSummary | undefined,
): string {
  const tickers = new Set((positions ?? []).flatMap(({ token }) => getAsset(token)?.ticker ?? []))

  return [...tickers].sort().slice(0, MAX_PORTFOLIO_MARKETS).join(',')
}
