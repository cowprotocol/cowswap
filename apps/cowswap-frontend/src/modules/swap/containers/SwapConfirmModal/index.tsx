import { ReactNode, useCallback, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import {
  QuoteDetails,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  useBridgeQuoteAmounts,
} from 'modules/bridge'
import { QuoteBridgeContext, QuoteSwapContext } from 'modules/bridge/types'
import { useTokensBalancesCombined } from 'modules/combinedBalances/hooks/useTokensBalancesCombined'
import { OrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useGetReceiveAmountInfo,
  useTradeConfirmActions,
  useCommonTradeConfirmContext,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { HighFeeWarning, RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { RateInfo } from 'common/pure/RateInfo'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'
import { buildSwapBridgeClickEvent } from '../TradeButtons/analytics'

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
}

interface BridgeConfirmContentProps {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  bridgeProvider: BridgeProviderInfo
  swapContext: QuoteSwapContext
  bridgeContext: QuoteBridgeContext
  restContent: ReactNode
}

function BridgeConfirmContent({
  rateInfoParams,
  bridgeProvider,
  swapContext,
  bridgeContext,
  restContent,
}: BridgeConfirmContentProps): ReactNode {
  return (
    <>
      <RateInfo label={t`Price`} rateInfoParams={rateInfoParams} fontSize={13} fontBold labelBold />
      <QuoteDetails
        isCollapsible
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
        bridgeContext={bridgeContext}
        hideRecommendedSlippage
      />
      {restContent}
      <HighFeeWarning readonlyMode />
    </>
  )
}

interface RegularConfirmContentProps {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  slippage: ReturnType<typeof useSwapDerivedState>['slippage']
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: Nullish<string>
  labelsAndTooltips: ReturnType<typeof useLabelsAndTooltips>
  deadline: ReturnType<typeof useSwapDeadlineState>[0]
  restContent: ReactNode
}

function RegularConfirmContent({
  rateInfoParams,
  slippage,
  receiveAmountInfo,
  recipient,
  recipientAddress,
  account,
  labelsAndTooltips,
  deadline,
  restContent,
}: RegularConfirmContentProps): ReactNode {
  return (
    <>
      {receiveAmountInfo && slippage && (
        <TradeBasicConfirmDetails
          rateInfoParams={rateInfoParams}
          slippage={slippage}
          receiveAmountInfo={receiveAmountInfo}
          recipient={recipient}
          recipientAddress={recipientAddress}
          account={account}
          labelsAndTooltips={labelsAndTooltips}
          hideLimitPrice
          hideUsdValues
          withTimelineDot={false}
        >
          <RowDeadline deadline={deadline} />
        </TradeBasicConfirmDetails>
      )}
      {restContent}
      <HighFeeWarning readonlyMode />
    </>
  )
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function SwapConfirmModal(props: SwapConfirmModalProps): ReactNode {
  const { t } = useLingui()
  const CONFIRM_TITLE = t`Swap`
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, recipientAddress, doTrade } = props

  const { chainId } = useWalletInfo()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const { account, isCurrentTradeBridging } = commonTradeConfirmContext
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage, inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useSwapDerivedState()
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
  const confirmClickEvent = useMemo(
    () =>
      buildSwapBridgeClickEvent({
        isCurrentTradeBridging,
        inputCurrency,
        outputCurrency,
        inputCurrencyAmount,
        outputCurrencyAmount,
        chainId,
        walletAddress: account,
      }),
    [
      account,
      chainId,
      inputCurrency,
      inputCurrencyAmount,
      isCurrentTradeBridging,
      outputCurrency,
      outputCurrencyAmount,
    ],
  )

  const bridgeConfirmChildren = useCallback(
    (restContent: ReactNode) => (
      <BridgeConfirmContent
        rateInfoParams={rateInfoParams}
        bridgeProvider={bridgeProvider as BridgeProviderInfo}
        swapContext={swapContext as QuoteSwapContext}
        bridgeContext={bridgeContext as QuoteBridgeContext}
        restContent={restContent}
      />
    ),
    [bridgeContext, bridgeProvider, rateInfoParams, swapContext],
  )

  const regularConfirmChildren = useCallback(
    (restContent: ReactNode) => (
      <RegularConfirmContent
        rateInfoParams={rateInfoParams}
        slippage={slippage}
        receiveAmountInfo={receiveAmountInfo}
        recipient={recipient}
        recipientAddress={recipientAddress}
        account={account}
        labelsAndTooltips={labelsAndTooltips}
        deadline={deadline}
        restContent={restContent}
      />
    ),
    [account, deadline, labelsAndTooltips, rateInfoParams, receiveAmountInfo, recipient, recipientAddress, slippage],
  )

  // TODO: Reduce function complexity by extracting logic
  const disableConfirm = useMemo(() => {
    const current = inputCurrencyInfo?.amount?.currency

    if (shouldDisplayBridgeDetails && !bridgeQuoteAmounts) {
      return true
    }

    if (current) {
      const normalisedAddress = getCurrencyAddress(current).toLowerCase()
      const balance = balances[normalisedAddress]
      const balanceAsCurrencyAmount = CurrencyAmount.fromRawAmount(current, balance?.toString() ?? '0')

      const isBalanceEnough = balanceAsCurrencyAmount
        ? inputCurrencyInfo?.amount?.equalTo(balanceAsCurrencyAmount) ||
          inputCurrencyInfo?.amount?.lessThan(balanceAsCurrencyAmount)
        : false

      return !isBalanceEnough
    }

    return true
  }, [balances, inputCurrencyInfo, shouldDisplayBridgeDetails, bridgeQuoteAmounts])

  const confirmText = shouldDisplayBridgeDetails ? t`Confirm Swap and Bridge` : t`Confirm Swap`

  const buttonText = useMemo(() => {
    const { amount } = inputCurrencyInfo
    const symbol = amount?.currency?.symbol || t`token`

    if (disableConfirm) {
      return t`Insufficient ${symbol} balance`
    }
    return confirmText
  }, [confirmText, disableConfirm, inputCurrencyInfo, t])

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        {...commonTradeConfirmContext}
        title={CONFIRM_TITLE}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={disableConfirm}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        confirmClickEvent={confirmClickEvent}
      >
        {shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext
          ? bridgeConfirmChildren
          : regularConfirmChildren}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
