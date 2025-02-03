import React from 'react'

import { Currency } from '@uniswap/sdk-core'

import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'
import { MetamaskTransactionWarning } from 'modules/tradeWidgetAddons'

const doTradeText = ''
const confirmText = ''
const confirmTrade = () => void 0

/**
 * This component is used only to display a button for Wrap/Unwrap
 * because of it, we just stub parameters above
 */
export function WrapFlowActionButton({ sellToken }: { sellToken: Currency }) {
  const primaryFormValidation = useGetTradeFormValidation()
  const tradeFormButtonContext = useTradeFormButtonContext(doTradeText, confirmTrade)

  if (!tradeFormButtonContext) return null

  return (
    <>
      <MetamaskTransactionWarning sellToken={sellToken} />
      <TradeFormButtons confirmText={confirmText} validation={primaryFormValidation} context={tradeFormButtonContext} />
    </>
  )
}
