import { useAtomValue } from 'jotai'
import React from 'react'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, TradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { twapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'

interface ActionButtonsProps {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
}

export function ActionButtons({ localFormValidation, primaryFormValidation }: ActionButtonsProps) {
  const { isPriceImpactAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const tradeConfirmActions = useTradeConfirmActions()
  const { walletIsNotConnected, showPriceImpactWarning } = useTwapWarningsContext()

  const confirmTrade = tradeConfirmActions.onOpen

  const areWarningsAccepted = showPriceImpactWarning ? isPriceImpactAccepted : true

  const primaryActionContext = {
    confirmTrade,
  }

  const tradeFormButtonContext = useTradeFormButtonContext('TWAP order', { doTrade: confirmTrade, confirmTrade })

  if (!tradeFormButtonContext) return null

  // Show local form validation errors only when wallet is connected
  if (localFormValidation && !walletIsNotConnected) {
    return <PrimaryActionButton state={localFormValidation} context={primaryActionContext} />
  }

  return (
    <TradeFormButtons
      doTradeText="Place TWAP order"
      confirmText="Review TWAP order"
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      // TODO: bind isExpertMode to settings
      isExpertMode={false}
      isDisabled={!areWarningsAccepted}
    />
  )
}
