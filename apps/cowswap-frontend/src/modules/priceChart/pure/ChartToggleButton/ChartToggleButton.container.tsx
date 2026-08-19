import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { NewTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { TrendingUp } from 'react-feather'

import { ToggleButton } from './ChartToggleButton.styled'

import { priceChartVisibleAtom } from '../../state/priceChartVisibleAtom'

export function ChartToggleButton(): ReactNode {
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)
  const label = isVisible ? t`Hide price chart` : t`Show price chart`

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
