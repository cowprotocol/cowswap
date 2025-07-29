import { ReactNode, useMemo } from 'react'

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
import { OrderSubmittedContent } from 'modules/orderProgressBar'
import {
  TradeBasicConfirmDetails,
  TradeConfirmation,
  TradeConfirmModal,
  useGetReceiveAmountInfo,
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

export interface SwapConfirmModalProps {
  doTrade(): Promise<false | void>

  inputCurrencyInfo: CurrencyPreviewInfo
  outputCurrencyInfo: CurrencyPreviewInfo
  priceImpact: PriceImpact
  recipient?: string | null
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function SwapConfirmModal(props: SwapConfirmModalProps): ReactNode {
  const { inputCurrencyInfo, outputCurrencyInfo, priceImpact, recipient, doTrade } = props

  const { account } = useWalletInfo()
  const { ensName } = useWalletDetails()
  const appData = useAppData()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeConfirmActions = useTradeConfirmActions()
  const { slippage, recipientAddress: derivedRecipientAddress } = useSwapDerivedState()
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

  const confirmText = shouldDisplayBridgeDetails ? 'Confirm Swap and Bridge' : 'Confirm Swap'

  const buttonText = useMemo(() => {
    if (disableConfirm) {
      const { amount } = inputCurrencyInfo
      return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
    }
    return confirmText
  }, [confirmText, disableConfirm, inputCurrencyInfo])

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
      >
        {shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext
          ? (restContent) => (
              <>
                <RateInfo label="Price" rateInfoParams={rateInfoParams} fontSize={13} fontBold labelBold />
                <QuoteDetails
                  isCollapsible
                  bridgeProvider={bridgeProvider}
                  swapContext={swapContext}
                  bridgeContext={bridgeContext}
                  hideRecommendedSlippage
                  recipient={bridgeContext.recipient}
                  recipientEnsName={recipient?.endsWith('.eth') && derivedRecipientAddress ? recipient : null}
                  account={account}
                  recipientChainId={bridgeContext?.buyAmount?.currency?.chainId}
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
                    recipientEnsName={recipient?.endsWith('.eth') && derivedRecipientAddress ? recipient : null}
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
