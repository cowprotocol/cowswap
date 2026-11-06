import { useAtomValue } from 'jotai'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import type { Currency } from '@cowprotocol/currency'
import { Media } from '@cowprotocol/ui'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useIsPriceChartAvailable } from './useIsPriceChartAvailable'

import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function usePriceChartVisibility(inputCurrency: Currency | null, outputCurrency: Currency | null): boolean {
  const isPriceChartAvailable = useIsPriceChartAvailable()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const isVisible = useAtomValue(priceChartVisibleAtom)

  return Boolean(
    isPriceChartAvailable &&
      !isProviderNetworkUnsupported &&
      (isUpToLarge || isVisible) &&
      (inputCurrency || outputCurrency),
  )
}
