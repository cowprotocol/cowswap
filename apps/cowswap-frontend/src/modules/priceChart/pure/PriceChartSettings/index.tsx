import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { priceChartVisibleAtom } from '../../state/priceChartVisibleAtom'

export function PriceChartSettings(): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)

  if (!isPriceChartEnabled) return null

  return (
    <SettingsBox
      title={t`Show price chart`}
      tooltip={t`Show or hide the price chart next to the trade form.`}
      checked={isVisible}
      toggle={() => setIsVisible((value) => !value)}
    />
  )
}
