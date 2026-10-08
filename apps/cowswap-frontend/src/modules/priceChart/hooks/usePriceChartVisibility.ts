import { useAtomValue } from 'jotai'

import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import type { Currency } from '@cowprotocol/currency'
import { Media } from '@cowprotocol/ui'

import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function usePriceChartVisibility(inputCurrency: Currency | null, outputCurrency: Currency | null): boolean {
  const { isPriceChartEnabled } = useFeatureFlags()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const isVisible = useAtomValue(priceChartVisibleAtom)

  return Boolean(isPriceChartEnabled && (isUpToLarge || isVisible) && (inputCurrency || outputCurrency))
}
