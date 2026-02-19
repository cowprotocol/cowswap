import { ReactNode, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { AffiliateTraderRewardsRow } from 'modules/affiliate/containers/AffiliateTraderRewardsRow'
import { useIsRewardsRowEnabled } from 'modules/affiliate/hooks/useIsRewardsRowEnabled'
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
  useGetConfirmButtonLabel,
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

import { buildSwapBridgeClickEvent, useSwapBridgeClickEventData } from '../../hooks/useSwapBridgeClickEvent'
import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

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
  const CONFIRM_TITLE = t`Swap`
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, recipientAddress, doTrade } = props

  const { account } = useWalletInfo()
  const appData = useAppData()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()
  const commonTradeConfirmContext = useCommonTradeConfirmContext()
  const swapBridgeClickEventData = useSwapBridgeClickEventData()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const { bridgeQuote } = useTradeQuote()

  const bridgeProvider = bridgeQuote?.providerInfo
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()
  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = <OrderSubmittedContent onDismiss={tradeConfirmActions.onDismiss} />
  const labelsAndTooltips = useLabelsAndTooltips()
  const isRewardsRowEnabled = useIsRewardsRowEnabled()

  const { values: balances } = useTokensBalancesCombined()

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

  const confirmText = useGetConfirmButtonLabel('swap', shouldDisplayBridgeDetails)

  const swapBridgeClickEvent = useMemo(
    () => buildSwapBridgeClickEvent({ ...swapBridgeClickEventData, action: 'swap_bridge_click' }),
    [swapBridgeClickEventData],
  )

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
        appData={appData}
        confirmClickEvent={swapBridgeClickEvent}
      >
        {shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext
          ? (restContent) => (
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
          : (restContent) => (
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
                    <>
                      {isRewardsRowEnabled && <AffiliateTraderRewardsRow />}
                      <RowDeadline deadline={deadline} />
                    </>
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
