import { useAtom } from 'jotai'
import { ReactNode } from 'react'

import { useFeatureFlags, useMediaQuery } from '@cowprotocol/common-hooks'
import { Media, NewTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { TrendingUp } from 'react-feather'

import { TradeIconButton, useDerivedTradeState } from 'modules/trade'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { priceChartModalOpenAtom } from '../state/priceChartModalOpenAtom'
import { priceChartVisibleAtom } from '../state/priceChartVisibleAtom'

export function PriceChartToggleButton(): ReactNode {
  const { isPriceChartEnabled } = useFeatureFlags()
  const { disablePriceChart } = useInjectedWidgetParams()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() ?? {}
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const [isModalOpen, setIsModalOpen] = useAtom(priceChartModalOpenAtom)
  const [isVisible, setIsVisible] = useAtom(priceChartVisibleAtom)
  const disabledReason = isProviderNetworkUnsupported
    ? t`Price chart is unavailable on this network.`
    : !inputCurrency && !outputCurrency
      ? t`Select a token to view its price chart.`
      : undefined
  const label = !disabledReason && !isUpToLarge && isVisible ? t`Hide price chart` : t`Show price chart`

  if (!isPriceChartEnabled || disablePriceChart) return null

  return (
    <NewTooltip content={disabledReason ?? label} placement="top">
      <TradeIconButton
        type="button"
        disabled={!!disabledReason}
        aria-label={label}
        aria-pressed={isUpToLarge ? undefined : !disabledReason && isVisible}
        aria-haspopup={isUpToLarge ? 'dialog' : undefined}
        aria-expanded={isUpToLarge ? isModalOpen : undefined}
        onClick={() => (isUpToLarge ? setIsModalOpen(true) : setIsVisible((value) => !value))}
      >
        <TrendingUp aria-hidden="true" />
      </TradeIconButton>
    </NewTooltip>
  )
}
