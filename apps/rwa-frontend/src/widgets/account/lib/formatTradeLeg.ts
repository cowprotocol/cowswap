import type { TradeLeg } from './tradeLeg'

import { formatTokenAmount, shortenAddress, toTokenUnits } from '@/shared/lib/format'

const priceFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 })

export function formatAssetAmount({ assetAmount, assetToken }: TradeLeg): string {
  return `${formatTokenAmount(assetAmount, assetToken.decimals)} ${assetToken.symbol}`
}

export function formatCounterAmount({ counterAmount, counterToken, counterTokenAddress }: TradeLeg): string {
  return `${formatTokenAmount(counterAmount, counterToken?.decimals)} ${getCounterSymbol(counterToken?.symbol, counterTokenAddress)}`
}

/** Counter token units per one asset token */
export function formatLegPrice(leg: TradeLeg): string {
  const { assetAmount, assetToken, counterAmount, counterToken, counterTokenAddress } = leg
  const assetUnits = toTokenUnits(assetAmount, assetToken.decimals)

  if (!counterToken || !assetUnits) return '—'

  const price = toTokenUnits(counterAmount, counterToken.decimals) / assetUnits

  return `${priceFormatter.format(price)} ${getCounterSymbol(counterToken.symbol, counterTokenAddress)}`
}

function getCounterSymbol(symbol: string | undefined, address: string): string {
  return symbol || shortenAddress(address)
}
