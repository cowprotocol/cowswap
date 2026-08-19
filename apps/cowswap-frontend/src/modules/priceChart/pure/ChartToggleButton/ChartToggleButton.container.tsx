import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { NewTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { TrendingUp } from 'react-feather'

import { ToggleButton } from './ChartToggleButton.styled'

import { usePriceChartFeatureFlags } from '../../hooks/usePriceChartFeatureFlags'
import { priceChartVisibleAtom } from '../../state/priceChartVisibleAtom'

export function ChartToggleButton(): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)
  const label = isVisible ? t`Hide price chart` : t`Show price chart`

  if (!isPriceChartEnabled) return null

  return (
    <NewTooltip content={label} placement="top">
      <ToggleButton
        type="button"
        aria-label={label}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((value) => !value)}
      >
        <TrendingUp aria-hidden="true" />
      </ToggleButton>
    </NewTooltip>
  )
}
