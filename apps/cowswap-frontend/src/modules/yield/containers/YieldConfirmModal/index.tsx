import React, { useCallback, useMemo } from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import { swapFlow } from 'modules/swap/services/swapFlow'
import type { SwapFlowContext } from 'modules/swap/services/types'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useOrderSubmittedContent,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  useTradePriceImpact,
} from 'modules/trade'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'

const CONFIRM_TITLE = 'Confirm order'

export interface YieldConfirmModalProps {
  tradeFlowContext: SwapFlowContext
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

export function YieldConfirmModal(props: YieldConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, tradeFlowContext: tradeContextInitial } = props

  /**
   * This is a very important part of the code.
   * After the confirmation modal opens, the trade context should not be recreated.
   * In order to prevent this, we use useMemo to keep the trade context the same when the modal was opened.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeFlowContext = useMemo(() => tradeContextInitial, [])

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useYieldDerivedState()
  const priceImpactParams = useTradePriceImpact()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId)

  const doTrade = useCallback(async () => {
    if (!tradeFlowContext) return

    swapFlow(tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)
  }, [tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee])

  const isConfirmDisabled = false // TODO: add conditions if needed

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
            <HighFeeWarning readonlyMode />
          </>
        )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
