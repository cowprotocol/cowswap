import { getWrappedToken } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import type { ChartAsset } from './chart.types'

export function createChartAssets(inputCurrency: Currency | null, outputCurrency: Currency | null): ChartAsset[] {
  if (!inputCurrency || !outputCurrency) return []

  const sellAsset = toChartAsset(inputCurrency)
  const buyAsset = toChartAsset(outputCurrency)

  return sellAsset.chainId === buyAsset.chainId && areAddressesEqual(sellAsset.address, buyAsset.address)
    ? [sellAsset]
    : [sellAsset, buyAsset]
}

export function getChartAssetKey(asset: ChartAsset): string {
  return `${asset.chainId}:${getAddressKey(asset.address)}`
}

function toChartAsset(currency: Currency): ChartAsset {
  return {
    address: getAddressKey(getWrappedToken(currency).address),
    chainId: currency.chainId as SupportedChainId,
    symbol: currency.symbol || 'TOKEN',
  }
}
