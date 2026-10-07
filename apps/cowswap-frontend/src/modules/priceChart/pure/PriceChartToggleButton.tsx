import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, NewTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { TrendingUp } from 'react-feather'

import { ToggleButton } from './PriceChartToggleButton.styled'

import { usePriceChartFeatureFlags } from '../hooks/usePriceChartFeatureFlags'
import { priceChartModalOpenAtom } from '../state/priceChartModalOpenAtom'
import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function PriceChartToggleButton(): ReactNode {
  const { isPriceChartEnabled } = usePriceChartFeatureFlags()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [isModalOpen, setIsModalOpen] = useAtom(priceChartModalOpenAtom)
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)
  const label = !isUpToLarge && isVisible ? t`Hide price chart` : t`Show price chart`

  if (!isPriceChartEnabled) return null

  return (
    <NewTooltip content={label} placement="top">
      <ToggleButton
        type="button"
        aria-label={label}
        aria-pressed={isUpToLarge ? undefined : isVisible}
        aria-haspopup={isUpToLarge ? 'dialog' : undefined}
        aria-expanded={isUpToLarge ? isModalOpen : undefined}
        onClick={() => (isUpToLarge ? setIsModalOpen(true) : setIsVisible((value) => !value))}
      >
        <TrendingUp aria-hidden="true" />
      </ToggleButton>
    </NewTooltip>
  )
}
