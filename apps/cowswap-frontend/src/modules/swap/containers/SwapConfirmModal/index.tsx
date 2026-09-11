import { ReactNode, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'
import { Nullish, UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { AffiliateTraderRewardsRow, useIsRewardsRowEnabled } from 'modules/affiliate'
import { useAppData } from 'modules/appData'
import {
  QuoteDetails,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  useBridgeQuoteAmounts,
} from 'modules/bridge'
import { useTokensBalancesCombined } from 'modules/combinedBalances/hooks/useTokensBalancesCombined'
import { OrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useFreezeWhileConfirming,
  useGetConfirmButtonLabel,
  useGetReceiveAmountInfo,
  useTradeConfirmActions,
  useCommonTradeConfirmContext,
} from 'modules/trade'
import { isQuoteExpired, useTradeQuote, useTradeQuoteCounter } from 'modules/tradeQuote'
import { HighFeeWarning, RowDeadline, RowQuoteId } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { RateInfo } from 'common/pure/RateInfo'

import { getSwapConfirmDisabledState } from './SwapConfirmModal.utils'
import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { buildSwapBridgeClickEvent, useSwapBridgeClickEventData } from '../../hooks/useSwapBridgeClickEvent'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>
  isTradeContextReady: boolean

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function SwapConfirmModal(props: SwapConfirmModalProps): ReactNode {
  const { t } = useLingui()
  const CONFIRM_TITLE = t`Review Swap`
  const {
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpact,
    recipient,
    recipientAddress,
    doTrade,
    isTradeContextReady,
  } = props

  const { account } = useWalletInfo()
  const appData = useAppData()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const swapBridgeClickEventData = useSwapBridgeClickEventData()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const tradeQuote = useTradeQuote()
  const quoteCounter = useTradeQuoteCounter()
  const { bridgeQuote, quote, error: quoteError, isLoading: isQuoteLoading } = tradeQuote
  const isQuoteStale = isQuoteExpired(tradeQuote) === true

  const bridgeProvider = bridgeQuote?.providerInfo
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()
  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()
  const quoteResponse = quoteError ? undefined : quote?.quoteResults.quoteResponse

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = <OrderSubmittedContent onDismiss={tradeConfirmActions.onDismiss} />
  const labelsAndTooltips = useLabelsAndTooltips()
  const isRewardsRowEnabled = useIsRewardsRowEnabled()

  // Freeze every quote-derived value shown in the review screen once the user clicks confirm, so
  // the modal can never display a different amount than what was actually confirmed/signed.
  const {
    shouldDisplayBridgeDetails: frozenShouldDisplayBridgeDetails,
    receiveAmountInfo: frozenReceiveAmountInfo,
    rateInfoParams: frozenRateInfoParams,
    quoteResponse: frozenQuoteResponse,
    swapContext: frozenSwapContext,
    bridgeContext: frozenBridgeContext,
    bridgeProvider: frozenBridgeProvider,
    slippage: frozenSlippage,
    deadline: frozenDeadline,
  } = useFreezeWhileConfirming({
    shouldDisplayBridgeDetails,
    receiveAmountInfo,
    rateInfoParams,
    quoteResponse,
    swapContext,
    bridgeContext,
    bridgeProvider,
    slippage,
    deadline,
  })

  const { values: balances } = useTokensBalancesCombined()

  // TODO: Reduce function complexity by extracting logic
  const { disableConfirm, isInsufficientBalance } = useMemo(() => {
    const hasCurrentCurrency = Boolean(inputCurrencyInfo?.amount?.currency)
    // Must cover the slippage-inclusive maximum sell amount, not just the expected sell amount,
    // otherwise the order can be placed while unfillable if the price moves against the user up to slippage.
    const maximumSellAmount = receiveAmountInfo?.afterSlippage.sellAmount ?? inputCurrencyInfo?.amount
    const current = maximumSellAmount?.currency
    let isBalanceEnough = false

    if (current) {
      const normalisedAddress = getAddressKey(getCurrencyAddress(current))
      const balance = balances[normalisedAddress]
      const balanceAsCurrencyAmount = CurrencyAmount.fromRawAmount(current, balance?.toString() ?? '0')

      isBalanceEnough = Boolean(
        balanceAsCurrencyAmount &&
          maximumSellAmount &&
          (maximumSellAmount.equalTo(balanceAsCurrencyAmount) || maximumSellAmount.lessThan(balanceAsCurrencyAmount)),
      )
    }

    return getSwapConfirmDisabledState({
      isTradeContextReady,
      shouldDisplayBridgeDetails,
      hasBridgeQuoteAmounts: Boolean(bridgeQuoteAmounts),
      hasCurrentCurrency,
      isBalanceEnough,
      isQuoteLoading,
      quoteCounter,
      isQuoteStale,
    })
  }, [
    balances,
    bridgeQuoteAmounts,
    inputCurrencyInfo,
    receiveAmountInfo,
    isQuoteLoading,
    isQuoteStale,
    isTradeContextReady,
    quoteCounter,
    shouldDisplayBridgeDetails,
  ])

  const confirmText = useGetConfirmButtonLabel('swap', shouldDisplayBridgeDetails, true)

  const swapBridgeClickEvent = useMemo(
    () =>
      buildSwapBridgeClickEvent({ ...swapBridgeClickEventData, action: 'swap_bridge_click', surface: 'confirm_modal' }),
    [swapBridgeClickEventData],
  )

  const buttonText = useMemo(() => {
    const { amount } = inputCurrencyInfo
    const symbol = amount?.currency?.symbol || t`token`

    if (isInsufficientBalance) {
      return t`Insufficient ${symbol} balance`
    }
    return confirmText
  }, [confirmText, inputCurrencyInfo, isInsufficientBalance, t])

  return (
    <TradeConfirmModal orderType={UiOrderType.SWAP} submittedContent={submittedContent}>
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
        appData={appData}
        confirmClickEvent={swapBridgeClickEvent}
      >
        {frozenShouldDisplayBridgeDetails && frozenBridgeProvider && frozenSwapContext && frozenBridgeContext
          ? (restContent) => (
              <>
                <RateInfo label={t`Price`} rateInfoParams={frozenRateInfoParams} fontSize={13} fontBold labelBold />
                <QuoteDetails
                  isCollapsible
                  bridgeProvider={frozenBridgeProvider}
                  swapContext={frozenSwapContext}
                  bridgeContext={frozenBridgeContext}
                  hideRecommendedSlippage
                />
                {restContent}
                <HighFeeWarning readonlyMode />
              </>
            )
          : (restContent) => (
              <>
                {frozenReceiveAmountInfo && frozenSlippage && (
                  <TradeBasicConfirmDetails
                    rateInfoParams={frozenRateInfoParams}
                    slippage={frozenSlippage}
                    receiveAmountInfo={frozenReceiveAmountInfo}
                    recipient={recipient}
                    recipientAddress={recipientAddress}
                    account={account}
                    labelsAndTooltips={labelsAndTooltips}
                    hideLimitPrice
                    hideUsdValues
                    withTimelineDot={false}
                  >
                    {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
                    <RowDeadline deadline={frozenDeadline} />
                    <RowQuoteId
                      quoteId={frozenQuoteResponse?.id}
                      isVerified={frozenQuoteResponse?.verified}
                      expiration={frozenQuoteResponse?.expiration}
                    />
                  </TradeBasicConfirmDetails>
                )}
                {restContent}
                <HighFeeWarning readonlyMode />
              </>
            )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
