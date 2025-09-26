import { ReactNode } from 'react'

import { Nullish } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import {
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  useBridgeQuoteAmounts,
} from 'modules/bridge'
import { useTokensBalancesCombined } from 'modules/combinedBalances/hooks/useTokensBalancesCombined'
import { OrderSubmittedContent } from 'modules/orderProgressBar'
import { TradeConfirmation, TradeConfirmModal, useGetReceiveAmountInfo, useTradeConfirmActions } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { HighFeeWarning } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

import { useBeforeContent } from './useBeforeContent'
import { useConfirmButtonText } from './useConfirmButtonText'
import { useConfirmClickEvent } from './useConfirmClickEvent'
import { useConfirmEventAmounts } from './useConfirmEventAmounts'
import { useDisableConfirm } from './useDisableConfirm'
import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
}

export function SwapConfirmModal(props: SwapConfirmModalProps): ReactNode {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, recipientAddress, doTrade } = props

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const { bridgeQuote } = useTradeQuote()

  const bridgeProvider = bridgeQuote?.providerInfo
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()
  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = <OrderSubmittedContent onDismiss={tradeConfirmActions.onDismiss} />
  const labelsAndTooltips = useLabelsAndTooltips()

  const { values: balances } = useTokensBalancesCombined()

  const disableConfirm = useDisableConfirm({
    inputCurrencyInfo,
    shouldDisplayBridgeDetails,
    bridgeQuoteAmounts,
    balances,
  })

  const confirmText = shouldDisplayBridgeDetails ? 'Confirm Swap and Bridge' : 'Confirm Swap'

  const buttonText = useConfirmButtonText(disableConfirm, inputCurrencyInfo, confirmText)

  const { inputAmount: eventInputAmount, outputAmount: eventOutputAmount } = useConfirmEventAmounts({
    shouldDisplayBridgeDetails,
    bridgeContext,
    inputCurrencyAmount: inputCurrencyInfo.amount,
    outputCurrencyAmount: outputCurrencyInfo.amount,
    receiveAmountInfo,
  })

  const confirmClickEvent = useConfirmClickEvent({
    inputAmount: eventInputAmount,
    outputAmount: eventOutputAmount,
    account,
    ensName,
    chainId,
  })

  const beforeContent = useBeforeContent({
    shouldDisplayBridgeDetails,
    bridgeProvider,
    swapContext,
    bridgeContext,
    rateInfoParams,
    receiveAmountInfo,
    slippage,
    recipient,
    recipientAddress,
    account,
    labelsAndTooltips,
    deadline,
  })

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
        isConfirmDisabled={disableConfirm}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        appData={appData || undefined}
        data-click-event={confirmClickEvent}
        beforeContent={beforeContent}
        afterContent={<HighFeeWarning readonlyMode />}
      />
    </TradeConfirmModal>
  )
}
