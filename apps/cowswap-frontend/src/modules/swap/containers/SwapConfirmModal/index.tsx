import { ReactNode, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

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

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import type { CowSwapGtmEvent } from 'common/analytics/types'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'
import { RateInfo } from 'common/pure/RateInfo'

import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'

function isConfirmClickEventBuildable(inputAmount: CurrencyAmount<Currency> | null | undefined): boolean {
  return Boolean(inputAmount && inputAmount.currency)
}

function isSwapConfirmBridge(
  shouldDisplayBridgeDetails: boolean,
  fromChainId: number | undefined,
  toChainId: number | undefined,
): boolean {
  return Boolean(shouldDisplayBridgeDetails && toChainId !== undefined && toChainId !== fromChainId)
}

function buildSwapConfirmLabel(
  fromChainId: number | undefined,
  toChainId: number | undefined,
  inputSymbol?: string,
  outputSymbol?: string,
  amountHuman?: string,
): string {
  return `From: ${fromChainId}, To: ${toChainId ?? 'unknown'}, TokenIn: ${inputSymbol || ''}, TokenOut: ${outputSymbol || ''}, Amount: ${amountHuman || ''}`
}

function buildSwapConfirmBaseEvent(params: {
  isBridge: boolean
  fromChainId: number | undefined
  toChainId: number | undefined
  walletAddress: string | undefined
  inputCurrency: Currency
  inputAmount: CurrencyAmount<Currency>
}): Omit<CowSwapGtmEvent, 'category'> & { category: CowSwapAnalyticsCategory } {
  const { isBridge, fromChainId, toChainId, walletAddress, inputCurrency, inputAmount } = params
  return {
    category: isBridge ? CowSwapAnalyticsCategory.Bridge : CowSwapAnalyticsCategory.TRADE,
    action: isBridge ? 'swap_bridge_confirm_click' : 'swap_confirm_click',
    label: buildSwapConfirmLabel(
      fromChainId,
      toChainId,
      inputCurrency.symbol || '',
      undefined,
      inputAmount.toSignificant(6),
    ),
    fromChainId,
    ...(toChainId !== undefined ? { toChainId } : {}),
    walletAddress,
    sellToken: getCurrencyAddress(inputCurrency),
    sellTokenSymbol: inputCurrency.symbol || '',
    sellTokenChainId: inputCurrency.chainId,
    sellAmount: inputAmount.quotient.toString(),
    sellAmountHuman: inputAmount.toSignificant(6),
    value: Number(inputAmount.toSignificant(6)),
  }
}

function buildSwapConfirmExtraFields(params: {
  outputCurrency?: Currency
  outputAmount?: CurrencyAmount<Currency> | null
}): Record<string, unknown> {
  const { outputCurrency, outputAmount } = params
  if (!outputCurrency || !outputAmount) return {}
  const extra: Record<string, unknown> = {
    buyToken: getCurrencyAddress(outputCurrency),
    buyTokenSymbol: outputCurrency.symbol || '',
    buyAmountExpected: outputAmount.quotient.toString(),
    buyAmountHuman: outputAmount.toSignificant(6),
  }
  if (typeof outputCurrency.chainId !== 'undefined') extra.buyTokenChainId = outputCurrency.chainId
  return extra
}

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

  const confirmClickEvent = useMemo(() => {
    const inputAmount = inputCurrencyInfo.amount
    const outputAmount = outputCurrencyInfo.amount
    const inputCurrency = inputAmount?.currency
    const outputCurrency = outputAmount?.currency
    if (!isConfirmClickEventBuildable(inputAmount)) return undefined

    const toChainId = outputCurrency?.chainId
    const isBridge = isSwapConfirmBridge(shouldDisplayBridgeDetails, chainId, toChainId)
    const base = buildSwapConfirmBaseEvent({
      isBridge,
      fromChainId: chainId,
      toChainId,
      walletAddress: account,
      inputCurrency: inputCurrency!,
      inputAmount: inputAmount!,
    })

    const extra = buildSwapConfirmExtraFields({ outputCurrency, outputAmount })

    return toCowSwapGtmEvent({ ...base, ...extra })
  }, [account, chainId, inputCurrencyInfo.amount, outputCurrencyInfo.amount, shouldDisplayBridgeDetails])

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
        beforeContent={
          shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext ? (
            <>
              <RateInfo label="Price" rateInfoParams={rateInfoParams} fontSize={13} fontBold labelBold />
              <QuoteDetails
                isCollapsible
                bridgeProvider={bridgeProvider}
                swapContext={swapContext}
                bridgeContext={bridgeContext}
                hideRecommendedSlippage
              />
            </>
          ) : receiveAmountInfo && slippage ? (
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
          ) : undefined
        }
        afterContent={<HighFeeWarning readonlyMode />}
      />
    </TradeConfirmModal>
  )
}
