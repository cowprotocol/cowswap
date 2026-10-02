import { getChainLabel } from '@/shared/lib/chain'

/** What the estimated total leaves out, `null` when it is complete */
export function getTotalExclusions(unpricedAssets: number, failedChainIds: number[]): string | null {
  const exclusions = [
    failedChainIds.length ? `balances on ${failedChainIds.map(getChainLabel).join(', ')}` : null,
    unpricedAssets ? `${unpricedAssets} asset${unpricedAssets === 1 ? '' : 's'} without a price` : null,
  ].filter(Boolean)

  return exclusions.length ? `Excludes ${exclusions.join(' and ')}` : null
}
