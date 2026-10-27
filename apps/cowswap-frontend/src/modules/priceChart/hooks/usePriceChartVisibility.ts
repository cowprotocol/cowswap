import { useAtomValue } from 'jotai'

import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import type { Currency } from '@cowprotocol/currency'
import { Media } from '@cowprotocol/ui'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function usePriceChartVisibility(inputCurrency: Currency | null, outputCurrency: Currency | null): boolean {
  const { isPriceChartEnabled } = useFeatureFlags()
  const { disablePriceChart } = useInjectedWidgetParams()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const isVisible = useAtomValue(priceChartVisibleAtom)

  return Boolean(
    isPriceChartEnabled &&
      !disablePriceChart &&
      !isProviderNetworkUnsupported &&
      !isProviderNetworkDeprecated &&
      (isUpToLarge || isVisible) &&
      (inputCurrency || outputCurrency),
  )
}
