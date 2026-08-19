import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'
import { priceChartVisibleAtom } from '../../state/priceChartVisibleAtom'

export function PriceChartSettings(): ReactNode {
  const { isAdvancedPriceChartEnabled, isPriceChartEnabled } = usePriceChartFeatureFlags()
  const [chartMode, setChartMode] = useAtom(priceChartModeAtom)
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)

  if (!isPriceChartEnabled) return null

  return (
    <>
      <SettingsBox
        title={t`Show price chart`}
        tooltip={t`Show or hide the price chart next to the trade form.`}
        checked={isVisible}
        toggle={() => setIsVisible((value) => !value)}
      />
      {isAdvancedPriceChartEnabled ? (
        <SettingsBox
          title={t`Advanced price chart`}
          tooltip={t`Turn this on for technical indicators, drawing tools, and more ways to explore price movements.`}
          checked={chartMode === 'advanced'}
          toggle={() => setChartMode(chartMode === 'advanced' ? 'simple' : 'advanced')}
        />
      ) : null}
    </>
  )
}
