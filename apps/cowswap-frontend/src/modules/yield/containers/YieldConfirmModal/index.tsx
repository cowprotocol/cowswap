import React, { useCallback, useMemo } from 'react'

import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { Field } from 'legacy/state/types'

import { useAppData } from 'modules/appData'
import { swapFlow } from 'modules/swap/services/swapFlow'
import type { SwapFlowContext } from 'modules/swap/services/types'
import {
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
  TradeBasicConfirmDetails,
  useTradePriceImpact,
} from 'modules/trade'

import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'
import { useYieldWidgetActions } from '../../hooks/useYieldWidgetActions'

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

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const { onChangeRecipient, onUserInput } = useYieldWidgetActions()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useYieldDerivedState()
  const priceImpactParams = useTradePriceImpact()
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const doTrade = useCallback(async () => {
    if (!tradeFlowContext) return

    const tradeResult = await swapFlow(tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee)

    const isPriceImpactDeclined = tradeResult === false

    // Clean up form fields after successful swap
    if (!isPriceImpactDeclined) {
      onChangeRecipient(null)
      onUserInput(Field.INPUT, '')
    }
  }, [tradeFlowContext, priceImpactParams, confirmPriceImpactWithoutFee])

  const isConfirmDisabled = false // TODO: add conditions if needed

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
