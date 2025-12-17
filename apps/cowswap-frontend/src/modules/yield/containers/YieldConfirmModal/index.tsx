import React, { ReactNode, useMemo } from 'react'

import { Nullish } from '@cowprotocol/types'

import { t } from '@lingui/core/macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import { OrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useCommonTradeConfirmContext,
  useGetReceiveAmountInfo,
  useTradeConfirmActions,
} from 'modules/trade'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'

const labelsAndTooltips = {
  // TODO: pass parameters
  slippageTooltip: getNonNativeSlippageTooltip(),
}

export interface YieldConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
}

export function YieldConfirmModal(props: YieldConfirmModalProps): ReactNode {
  const CONFIRM_TITLE = t`Confirm order`
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, recipientAddress, doTrade: _doTrade } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doTrade = useMemo(() => _doTrade, [])

  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const appData = useAppData()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useYieldDerivedState()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = <OrderSubmittedContent onDismiss={tradeConfirmActions.onDismiss} />

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={CONFIRM_TITLE}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText={t`Confirm Swap`}
        recipient={recipient}
        appData={appData}
      >
        {(restContent) => (
          <>
            {receiveAmountInfo && slippage && (
              <TradeBasicConfirmDetails
                rateInfoParams={rateInfoParams}
                slippage={slippage}
                receiveAmountInfo={receiveAmountInfo}
                recipient={recipient}
                recipientAddress={recipientAddress}
                account={commonTradeConfirmContext.account}
                labelsAndTooltips={labelsAndTooltips}
                hideLimitPrice
                hideUsdValues
                withTimelineDot={false}
              ></TradeBasicConfirmDetails>
            )}
            {restContent}
            <HighFeeWarning readonlyMode />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
