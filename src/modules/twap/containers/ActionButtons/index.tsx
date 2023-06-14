import React, { useEffect } from 'react'

import { useTradeConfirmActions } from 'modules/trade'
import { TradeFormButtons, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeFormButtonContext } from 'modules/tradeFormValidation'

import { useSetupFallbackHandler } from '../../hooks/useSetupFallbackHandler'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { PrimaryActionButton } from '../../pure/PrimaryActionButton'

export function ActionButtons() {
  const setFallbackHandler = useSetupFallbackHandler()
  const tradeConfirmActions = useTradeConfirmActions()
  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()

  const primaryActionContext = {
    setFallbackHandler,
    openConfirmModal: tradeConfirmActions.onOpen,
  }

  const confirmTrade = tradeConfirmActions.onOpen

  const tradeFormButtonContext = useTradeFormButtonContext('TWAP order', { doTrade: confirmTrade, confirmTrade })

  // TODO: It's a temporary tool! Just for testing purposes
  // TODO: must be removed before prod release
  useEffect(() => {
    ;(window as any)['resetFallbackHandler'] = () => {
      setFallbackHandler('0x0000000000000000000000000000000000000000')
    }
  }, [setFallbackHandler])

  if (!tradeFormButtonContext) return null

  if (localFormValidation) {
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
      isDisabled={false}
    />
  )
}
