import React from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  TradeBasicConfirmDetails,
} from 'modules/trade'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'

const CONFIRM_TITLE = 'Confirm order'

export interface YieldConfirmModalProps {
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function YieldConfirmModal(props: YieldConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient } = props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useYieldDerivedState()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const doTrade = () => {
    console.log('TODO doTrade')
  }

  // TODO
  const isConfirmDisabled = false

  return (
    <TradeConfirmModal title={CONFIRM_TITLE}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={isConfirmDisabled}
        priceImpact={priceImpact}
        buttonText="Confirm and swap" // TODO
        recipient={recipient}
        appData={appData || undefined}
        isPriceStatic={true}
      >
        {(restContent) => (
          <>
            {receiveAmountInfo && slippage && (
              <TradeBasicConfirmDetails
                rateInfoParams={rateInfoParams}
                slippage={slippage}
                receiveAmountInfo={receiveAmountInfo}
                recipient={recipient}
                account={account}
                hideLimitPrice
                hideUsdValues
                withTimelineDot={false}
                alwaysRow
              ></TradeBasicConfirmDetails>
            )}
            {restContent}
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
