import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { priceChartModeAtom } from '../../state/priceChartModeAtom'
import { priceChartSupplyBasisAtom } from '../../state/priceChartSupplyBasisAtom'
import { priceChartVisibleAtom } from '../../state/priceChartVisibleAtom'

export function PriceChartSettings(): ReactNode {
  const { isAdvancedPriceChartEnabled, isPriceChartEnabled } = usePriceChartFeatureFlags()
  const [chartMode, setChartMode] = useAtom(priceChartModeAtom)
  const [supplyBasis, setSupplyBasis] = useAtom(priceChartSupplyBasisAtom)
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
      <SettingsBox
        title={t`Total supply for Market Cap`}
        tooltip={t`Market Cap is an approximation based on the latest reported supply. Total supply can include locked, burned, or otherwise non-circulating tokens.`}
        checked={supplyBasis === 'total'}
        toggle={() => setSupplyBasis(supplyBasis === 'total' ? 'circulating' : 'total')}
      />
    </>
  )
}
