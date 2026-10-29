import type { RwaAsset, RwaAssetType } from '@/entities/asset'

import { getChainLabel } from '@/shared/lib/chain'

const ASSET_TYPE_NOUNS: Record<RwaAssetType, string> = { stock: 'stock', index: 'ETF' }

const MAX_LISTED_NETWORKS = 3

export function getAssetSeoDescription(asset: RwaAsset): string {
  const { title, ticker, type } = asset

  return (
    `Third-party tokens referencing ${title} (${ticker}) ${ASSET_TYPE_NOUNS[type]}, with swaps powered by CoW Protocol: ` +
    `${getAssetSeoTokensLabel(asset)}.`
  )
}

export function getAssetSeoTitle({ title, ticker, type }: RwaAsset): string {
  return `${title} (${ticker}) tokenized ${ASSET_TYPE_NOUNS[type]}`
}

/** E.g. `xStocks and Ondo tokens on Ethereum, BNB Chain, Arbitrum and 2 more networks` */
export function getAssetSeoTokensLabel({ tokens }: RwaAsset): string {
  const issuers = [...new Set(tokens.map(({ issuer }) => issuer))]
  const networks = [...new Set(tokens.map(({ chainId }) => chainId))].map(getChainLabel)
  const listedNetworks = networks.slice(0, MAX_LISTED_NETWORKS)
  const hiddenCount = networks.length - listedNetworks.length

  const networksLabel =
    hiddenCount > 0
      ? `${listedNetworks.join(', ')} and ${hiddenCount} more ${hiddenCount === 1 ? 'network' : 'networks'}`
      : joinWithAnd(listedNetworks)

  return `${joinWithAnd(issuers)} ${issuers.length === 1 ? 'token' : 'tokens'} on ${networksLabel}`
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items.join('')

  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}
