import React from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { TradeConfirmation, TradeConfirmModal, useTradeConfirmActions } from 'modules/trade'

import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

export interface ConfirmSwapModalSetupProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  doTrade(): void
}

export function ConfirmSwapModalSetup(props: ConfirmSwapModalSetupProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, doTrade, priceImpact } = props

  const tradeConfirmActions = useTradeConfirmActions()

  return (
    <TradeConfirmModal>
      <TradeConfirmation
        title="Confirm Swap"
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText="Confirm Swap"
      >
        <>{/*TODO: RR add price, amounts, and fee info*/}</>
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
