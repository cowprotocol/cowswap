import { useAtomValue } from 'jotai'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useIsPriceChartAvailable } from './useIsPriceChartAvailable'

import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function usePriceChartVisibility(): boolean {
  const isPriceChartAvailable = useIsPriceChartAvailable()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const isVisible = useAtomValue(priceChartVisibleAtom)

  return Boolean(
    isPriceChartAvailable &&
      !isProviderNetworkUnsupported &&
      !isProviderNetworkDeprecated &&
      (isUpToLarge || isVisible),
  )
}
