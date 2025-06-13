import React, { useMemo } from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import { useOrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
} from 'modules/trade'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'

const CONFIRM_TITLE = 'Confirm order'

const labelsAndTooltips = {
  // TODO: pass parameters
  slippageTooltip: getNonNativeSlippageTooltip(),
}

export interface YieldConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function YieldConfirmModal(props: YieldConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade: _doTrade } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const doTrade = useMemo(() => _doTrade, [])

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useYieldDerivedState()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId)

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={false}
        priceImpact={priceImpact}
        buttonText="Confirm Swap"
        recipient={recipient}
        appData={appData || undefined}
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
