import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { BannerOrientation, TokenSymbol } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { PiTrendUpBold } from 'react-icons/pi'

import { Order } from 'legacy/state/orders/actions'

import { getTakeProfitNavigation, getTakeProfitOrder, PricePercentageShortcuts } from 'modules/trade'

import { useNavigate } from 'common/hooks/useNavigate'

import * as styledEl from './TakeProfitPrompt.styled'
import { isTakeProfitPromptEnabled } from './takeProfitPrompt.utils'

export interface TakeProfitPromptProps {
  order: Order
  onDismiss?: Command
}

export function TakeProfitPrompt({ order, onDismiss }: TakeProfitPromptProps): ReactNode {
  const navigate = useNavigate()
  const widgetParams = useInjectedWidgetParams()

  if (!isTakeProfitPromptEnabled(widgetParams)) return null

  const takeProfitOrder = getTakeProfitOrder(order)
  if (!takeProfitOrder) return null

  const openLimitOrder = (percentage: string | null): void => {
    navigate(getTakeProfitNavigation(takeProfitOrder, percentage))
    onDismiss?.()
  }

  return (
    <styledEl.Banner
      customIcon={
        <styledEl.TrendIcon>
          <PiTrendUpBold aria-hidden />
        </styledEl.TrendIcon>
      }
      orientation={BannerOrientation.Horizontal}
      noWrapContent
      borderRadius="16px"
      padding="12px"
      margin="0"
    >
      <styledEl.Content>
        <styledEl.Title>
          <Trans>
            Take profit on your <TokenSymbol token={takeProfitOrder.inputAmount.currency} />
          </Trans>
        </styledEl.Title>
        <styledEl.Description>
          <Trans>Limit order to sell at a higher price. How much higher?</Trans>
        </styledEl.Description>
        <PricePercentageShortcuts isInverted={false} disabled={false} onSelect={openLimitOrder} />
      </styledEl.Content>
    </styledEl.Banner>
  )
}
