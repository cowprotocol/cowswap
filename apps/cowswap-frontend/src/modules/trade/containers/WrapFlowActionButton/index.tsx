import React from 'react'

import { Currency } from '@uniswap/sdk-core'

import { TradeFormButtons, useGetTradeFormValidation, useTradeFormButtonContext } from 'modules/tradeFormValidation'
import { MetamaskTransactionWarning } from 'modules/tradeWidgetAddons'

const doTradeText = ''
const confirmText = ''
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const confirmTrade = () => void 0

/**
 * This component is used only to display a button for Wrap/Unwrap
 * because of it, we just stub parameters above
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
