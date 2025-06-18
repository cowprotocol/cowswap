import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import type { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { useAppData } from 'modules/appData'
import {
  QuoteDetails,
  useQuoteBridgeContext,
  useQuoteSwapContext,
  useShouldDisplayBridgeDetails,
  useBridgeQuoteAmounts,
} from 'modules/bridge'
import { useTokensBalancesCombined } from 'modules/combinedBalances/hooks/useTokensBalancesCombined'
import { useOrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useReceiveAmountInfo,
  useTradeConfirmActions,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { HighFeeWarning, RowDeadline } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { RateInfo } from 'common/pure/RateInfo'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'
const PRICE_UPDATE_INTERVAL = ms`30s`

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SwapConfirmModal(props: SwapConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade } = props

  const { account, chainId } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage } = useSwapDerivedState()
  const [deadline] = useSwapDeadlineState()

  const shouldDisplayBridgeDetails = useShouldDisplayBridgeDetails()
  const { bridgeQuote } = useTradeQuote()

  const bridgeProvider = bridgeQuote?.providerInfo
  const bridgeQuoteAmounts = useBridgeQuoteAmounts(receiveAmountInfo, bridgeQuote)
  const swapContext = useQuoteSwapContext()
  const bridgeContext = useQuoteBridgeContext()

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId, bridgeQuoteAmounts || undefined)
  const labelsAndTooltips = useLabelsAndTooltips()

  const { values: balances } = useTokensBalancesCombined()

  // TODO: Reduce function complexity by extracting logic
  // eslint-disable-next-line complexity
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

  const buttonText = useMemo(() => {
    if (disableConfirm) {
      const { amount } = inputCurrencyInfo
      return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
    }
    return 'Confirm Swap'
  }, [disableConfirm, inputCurrencyInfo])

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
        refreshInterval={PRICE_UPDATE_INTERVAL}
      >
        {shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext
          ? (restContent) => (
              <>
                <RateInfo label="Price" rateInfoParams={rateInfoParams} />
                <QuoteDetails
                  isCollapsible
                  bridgeProvider={bridgeProvider}
                  swapContext={swapContext}
                  bridgeContext={bridgeContext}
                />
                {restContent}
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
            )}
      </TradeConfirmation>
    </TradeConfirmModal>
  )
}
