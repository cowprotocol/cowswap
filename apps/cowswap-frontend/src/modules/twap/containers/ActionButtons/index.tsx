import { useCowAnalytics, Category } from '@cowprotocol/analytics'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { useAreWarningsAccepted } from '../../hooks/useAreWarningsAccepted'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface ActionButtonsProps {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
  fallbackHandlerIsNotSet: boolean
}

export function ActionButtons({
  localFormValidation,
  primaryFormValidation,
  fallbackHandlerIsNotSet,
}: ActionButtonsProps) {
  const tradeConfirmActions = useTradeConfirmActions()
  const { walletIsNotConnected } = useTwapWarningsContext()

  const confirmTrade = () => {
    tradeConfirmActions.onOpen()
    twapConversionAnalytics('initiated', fallbackHandlerIsNotSet)
  }

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

const twapConversionAnalytics = (status: string, fallbackHandlerIsNotSet: boolean) => {
  const cowAnalytics = useCowAnalytics()
  cowAnalytics.sendEvent({
    category: Category.TWAP,
    action: 'Conversion',
    label: `${status}|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
  })
}
