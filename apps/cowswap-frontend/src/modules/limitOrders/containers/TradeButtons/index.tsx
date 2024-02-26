import { useAtomValue } from 'jotai'
import React from 'react'

import { Trans } from '@lingui/macro'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useHandleOrderPlacement } from 'modules/limitOrders/hooks/useHandleOrderPlacement'
import { useLimitOrdersWarningsAccepted } from 'modules/limitOrders/hooks/useLimitOrdersWarningsAccepted'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useTradeConfirmActions } from 'modules/trade'
import {
  TradeFormBlankButton,
  TradeFormButtons,
  useGetTradeFormValidation,
  useTradeFormButtonContext,
} from 'modules/tradeFormValidation'

import { limitOrdersTradeButtonsMap } from './limitOrdersTradeButtonsMap'

import { useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'

const CONFIRM_TEXT = 'Review limit order'

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

  const defaultText = CONFIRM_TEXT

  const tradeFormButtonContext = useTradeFormButtonContext(defaultText, { doTrade: handleTrade, confirmTrade })

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
      confirmText={CONFIRM_TEXT}
      validation={primaryFormValidation}
      context={tradeFormButtonContext}
      isDisabled={!warningsAccepted}
    />
  )
}
