import { useMemo, useEffect, useRef } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

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
import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  isTradeLoading: boolean
  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SwapConfirmModal(props: SwapConfirmModalProps) {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade, isTradeLoading } = props

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

  // Stabilize bridge and quote during context switches
  const stableBridgeDataRef = useRef<{
    bridgeProvider?: typeof bridgeProvider
    bridgeQuoteAmounts?: typeof bridgeQuoteAmounts
    swapContext?: typeof swapContext
    bridgeContext?: typeof bridgeContext
    outputCurrencyInfo?: CurrencyPreviewInfo
  }>({})

  // Update stable data whenever we have valid bridge information
  useEffect(() => {
    if (bridgeProvider && bridgeQuoteAmounts && swapContext && bridgeContext && outputCurrencyInfo.amount) {
      stableBridgeDataRef.current = {
        bridgeProvider,
        bridgeQuoteAmounts,
        swapContext,
        bridgeContext,
        outputCurrencyInfo,
      }
    }
  }, [bridgeProvider, bridgeQuoteAmounts, swapContext, bridgeContext, outputCurrencyInfo])

  // Use stable values when context is switching
  const isContextSwitching = shouldDisplayBridgeDetails && (!bridgeQuoteAmounts || !swapContext || !bridgeContext)
  const effectiveOutputCurrencyInfo = isContextSwitching
    ? stableBridgeDataRef.current.outputCurrencyInfo || outputCurrencyInfo
    : outputCurrencyInfo

  // Get effective bridge amounts for stability
  const effectiveBridgeAmounts = isContextSwitching
    ? stableBridgeDataRef.current.bridgeQuoteAmounts
    : bridgeQuoteAmounts

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, effectiveOutputCurrencyInfo.amount)
  const submittedContent = useOrderSubmittedContent(chainId, effectiveBridgeAmounts || undefined)
  const labelsAndTooltips = useLabelsAndTooltips()

  const { values: balances } = useTokensBalancesCombined()

  // TODO: Reduce function complexity by extracting logic

  const disableConfirm = useMemo(() => {
    // Always disable when a new quote is being fetched
    if (isTradeLoading) {
      return true
    }

    const current = inputCurrencyInfo?.amount?.currency

    if (shouldDisplayBridgeDetails && !effectiveBridgeAmounts) {
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
  }, [balances, inputCurrencyInfo, shouldDisplayBridgeDetails, effectiveBridgeAmounts, isTradeLoading])

  const buttonText = useMemo(() => {
    // A trade is loading...
    if (isTradeLoading) {
      // ...but we likely have old data to show. It's a refresh.
      if (effectiveOutputCurrencyInfo.amount) {
        return <TradeLoadingButton />
      }
      // ...and we have no data. It's an initial load.
      return 'Loading your trade...'
    }

    // A trade is not loading, but the button is disabled. Must be insufficient balance.
    if (disableConfirm) {
      const { amount } = inputCurrencyInfo
      return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
    }

    // Everything is good.
    return 'Confirm Swap'
  }, [disableConfirm, isTradeLoading, effectiveOutputCurrencyInfo.amount, inputCurrencyInfo])

  return (
    <TradeConfirmModal title={CONFIRM_TITLE} submittedContent={submittedContent}>
      <TradeConfirmation
        title={CONFIRM_TITLE}
        account={account}
        ensName={ensName}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={effectiveOutputCurrencyInfo}
        onConfirm={doTrade}
        onDismiss={tradeConfirmActions.onDismiss}
        isConfirmDisabled={disableConfirm}
        priceImpact={priceImpact}
        buttonText={buttonText}
        recipient={recipient}
        appData={appData || undefined}
      >
        {shouldDisplayBridgeDetails &&
        (isContextSwitching
          ? stableBridgeDataRef.current.bridgeProvider &&
            stableBridgeDataRef.current.swapContext &&
            stableBridgeDataRef.current.bridgeContext
          : bridgeProvider && swapContext && bridgeContext)
          ? (restContent) => {
              const effectiveBridgeProvider = isContextSwitching
                ? stableBridgeDataRef.current.bridgeProvider!
                : bridgeProvider!
              const effectiveSwapContext = isContextSwitching ? stableBridgeDataRef.current.swapContext! : swapContext!
              const effectiveBridgeContext = isContextSwitching
                ? stableBridgeDataRef.current.bridgeContext!
                : bridgeContext!

              return (
                <>
                  <RateInfo label="Price" rateInfoParams={rateInfoParams} />
                  <QuoteDetails
                    isCollapsible
                    bridgeProvider={effectiveBridgeProvider}
                    swapContext={effectiveSwapContext}
                    bridgeContext={effectiveBridgeContext}
                  />
                  {restContent}
                </>
              )
            }
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
