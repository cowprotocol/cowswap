import { useAtomValue } from 'jotai/utils'
import React from 'react'

import { Trans } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useTradeConfirmActions } from 'modules/trade'
import {
  TradeFormButtons,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
  TradeFormBlankButton,
} from 'modules/tradeFormValidation'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

export interface TradeButtonsProps {
  tradeContext: TradeFlowContext | null
  priceImpact: PriceImpact
}

export function TradeButtons(props: TradeButtonsProps) {
  const { tradeContext, priceImpact } = props

  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const warningsAccepted = useLimitOrdersWarningsAccepted(false)
  const tradeConfirmActions = useTradeConfirmActions()

  const handleTrade = useHandleOrderPlacement(tradeContext, priceImpact, settingsState, tradeConfirmActions)
  const confirmTrade = tradeConfirmActions.onOpen
  const isExpertMode = settingsState.expertMode

  const tradeFormButtonContext = useTradeFormButtonContext('Limit order', { doTrade: handleTrade, confirmTrade })

  if (!tradeFormButtonContext) return null

  // Display local form validation errors only when there are no primary errors
  if (!primaryFormValidation && localFormValidation) {
    const buttonFactory = limitOrdersTradeButtonsMap[localFormValidation]

    return typeof buttonFactory === 'function' ? (
      buttonFactory()
    ) : (
      <TradeFormBlankButton id={buttonFactory.id} disabled={true}>
        <Trans>{buttonFactory.text}</Trans>
      </TradeFormBlankButton>
    )
  }

  return (
    <TradeFormButtons
      doTradeText="Place limit order"
      confirmText="Review limit order"
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isExpertMode={isExpertMode}
      isDisabled={!warningsAccepted}
    />
  )
}
