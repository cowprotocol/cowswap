import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useAreWarningsAccepted } from '../../hooks/useAreWarningsAccepted'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface ActionButtonsProps {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
  fallbackHandlerIsNotSet: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ActionButtons({
  localFormValidation,
  primaryFormValidation,
  fallbackHandlerIsNotSet,
}: ActionButtonsProps) {
  const tradeConfirmActions = useTradeConfirmActions()
  const { walletIsNotConnected } = useTwapWarningsContext()
  const cowAnalytics = useCowAnalytics()

  const twapConversionAnalytics = useCallback(
    (status: string, fallbackHandlerIsNotSet: boolean) => {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Conversion',
        label: `${status}|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
      })
    },
    [cowAnalytics],
  )

  const confirmTrade = useCallback(() => {
    tradeConfirmActions.onOpen()
    twapConversionAnalytics('initiated', fallbackHandlerIsNotSet)
  }, [tradeConfirmActions, twapConversionAnalytics, fallbackHandlerIsNotSet])

  const areWarningsAccepted = useAreWarningsAccepted()

  const primaryActionContext = {
    confirmTrade,
  }

  const tradeFormButtonContext = useTradeFormButtonContext('TWAP order', confirmTrade)

  if (!tradeFormButtonContext) return null

  // Show local form validation errors only when wallet is connected
  if (localFormValidation && !walletIsNotConnected) {
    return <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
  }

  return (
    <TradeFormButtons
      confirmText="Review TWAP order"
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={!areWarningsAccepted}
    />
  )
}
