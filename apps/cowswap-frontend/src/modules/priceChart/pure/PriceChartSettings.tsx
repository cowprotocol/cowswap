import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useIsPriceChartAvailable } from '../hooks/useIsPriceChartAvailable'
import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function PriceChartSettings(): ReactNode {
  const isPriceChartAvailable = useIsPriceChartAvailable()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)

  if (!isPriceChartAvailable || isUpToLarge) return null

  return (
    <SettingsBox
      title={t`Show price chart`}
      tooltip={t`Show or hide the price chart next to the trade form.`}
      checked={!isProviderNetworkUnsupported && isVisible}
      disabled={isProviderNetworkUnsupported}
      toggle={() => setIsVisible((value) => !value)}
    />
  )
}
