import type { RwaAssetSummary, RwaTokenSummary } from '@/entities/asset'
import type { Position } from '@/widgets/account'

export function getHeldTickersKey(
  positions: Position[] | null,
  getAsset: (token: RwaTokenSummary) => RwaAssetSummary | undefined,
): string {
  const tickers = new Set((positions ?? []).flatMap(({ token }) => getAsset(token)?.ticker ?? []))

  return [...tickers].sort().join(',')
}
