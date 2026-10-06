import { getWrappedToken } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, type SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency } from '@cowprotocol/currency'

import type { PriceChartAsset, PriceChartAssetDescriptor, PriceChartSelection } from './priceChart.types'

export function createChartAssets(inputCurrency: Currency | null, outputCurrency: Currency | null): PriceChartAsset[] {
  if (!inputCurrency || !outputCurrency) return []

  const sellAsset = toChartAsset(inputCurrency, 'sell')
  const buyAsset = toChartAsset(outputCurrency, 'buy')

  return sellAsset.chainId === buyAsset.chainId && areAddressesEqual(sellAsset.address, buyAsset.address)
    ? [sellAsset]
    : [sellAsset, buyAsset]
}

export function getChartAssetKey(asset: Pick<PriceChartAssetDescriptor, 'address' | 'chainId'>): string {
  return `${asset.chainId}:${getAddressKey(asset.address)}`
}

function toChartAsset(currency: Currency, selection: PriceChartSelection): PriceChartAsset {
  return {
    address: getAddressKey(getWrappedToken(currency).address),
    chainId: currency.chainId as SupportedChainId,
    selection,
    symbol: currency.symbol || 'TOKEN',
  }
}
