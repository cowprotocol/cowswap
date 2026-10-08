import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, NewTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { TrendingUp } from 'react-feather'

import { TradeIconButton } from 'modules/trade'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { priceChartModalOpenAtom } from '../state/priceChartModalOpenAtom'
import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function PriceChartToggleButton(): ReactNode {
  const { isPriceChartEnabled } = useFeatureFlags()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [isModalOpen, setIsModalOpen] = useAtom(priceChartModalOpenAtom)
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)
  const label = !isProviderNetworkUnsupported && !isUpToLarge && isVisible ? t`Hide price chart` : t`Show price chart`

  if (!isPriceChartEnabled) return null

  return (
    <NewTooltip content={label} placement="top">
      <TradeIconButton
        type="button"
        disabled={isProviderNetworkUnsupported}
        aria-label={label}
        aria-pressed={isUpToLarge ? undefined : !isProviderNetworkUnsupported && isVisible}
        aria-haspopup={isUpToLarge ? 'dialog' : undefined}
        aria-expanded={isUpToLarge ? isModalOpen : undefined}
        onClick={() => (isUpToLarge ? setIsModalOpen(true) : setIsVisible((value) => !value))}
      >
        <TrendingUp aria-hidden="true" />
      </TradeIconButton>
    </NewTooltip>
  )
}
