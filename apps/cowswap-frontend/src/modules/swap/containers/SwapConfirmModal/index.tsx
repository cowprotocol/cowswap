import { ReactNode, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import type { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { Nullish } from '@cowprotocol/types'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import type { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

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

import { buildSwapConfirmEvent } from './analytics'
import { useLabelsAndTooltips } from './useLabelsAndTooltips'

import { useSwapDerivedState } from '../../hooks/useSwapDerivedState'
import { useSwapDeadlineState } from '../../hooks/useSwapSettings'

const CONFIRM_TITLE = 'Swap'

type DisableConfirmParams = {
  inputCurrencyInfo: CurrencyPreviewInfo
  shouldDisplayBridgeDetails: boolean
  bridgeQuoteAmounts: ReturnType<typeof useBridgeQuoteAmounts>
  balances: { [address: string]: BigNumber | undefined }
}

function useDisableConfirm({
  inputCurrencyInfo,
  shouldDisplayBridgeDetails,
  bridgeQuoteAmounts,
  balances,
}: DisableConfirmParams): boolean {
  return useMemo(() => {
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
}

type BridgeBeforeProps = {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  bridgeProvider: NonNullable<ReturnType<typeof useTradeQuote>['bridgeQuote']>['providerInfo']
  swapContext: NonNullable<ReturnType<typeof useQuoteSwapContext>>
  bridgeContext: NonNullable<ReturnType<typeof useQuoteBridgeContext>>
}

function BridgeBeforeContent({
  rateInfoParams,
  bridgeProvider,
  swapContext,
  bridgeContext,
}: BridgeBeforeProps): ReactNode {
  return (
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
  )
}

type DefaultBeforeProps = {
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  slippage: Percent | null
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: string | undefined
  labelsAndTooltips: ReturnType<typeof useLabelsAndTooltips>
  deadline: number
}

function DefaultBeforeContent(props: DefaultBeforeProps): ReactNode {
  const {
    rateInfoParams,
    slippage,
    receiveAmountInfo,
    recipient,
    recipientAddress,
    account,
    labelsAndTooltips,
    deadline,
  } = props

  if (!receiveAmountInfo || !slippage) return null

  return (
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
  )
}

function useBeforeContent(params: {
  shouldDisplayBridgeDetails: boolean
  bridgeProvider?: BridgeProviderInfo
  swapContext: ReturnType<typeof useQuoteSwapContext>
  bridgeContext: ReturnType<typeof useQuoteBridgeContext>
  rateInfoParams: ReturnType<typeof useRateInfoParams>
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
  slippage: Percent | null
  recipient: Nullish<string>
  recipientAddress: Nullish<string>
  account: string | undefined
  labelsAndTooltips: ReturnType<typeof useLabelsAndTooltips>
  deadline: number
}): ReactNode {
  const {
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
  } = params

  return useMemo(() => {
    return shouldDisplayBridgeDetails && bridgeProvider && swapContext && bridgeContext ? (
      <BridgeBeforeContent
        rateInfoParams={rateInfoParams}
        bridgeProvider={bridgeProvider}
        swapContext={swapContext}
        bridgeContext={bridgeContext}
      />
    ) : receiveAmountInfo && slippage ? (
      <DefaultBeforeContent
        rateInfoParams={rateInfoParams}
        slippage={slippage}
        receiveAmountInfo={receiveAmountInfo}
        recipient={recipient}
        recipientAddress={recipientAddress}
        account={account}
        labelsAndTooltips={labelsAndTooltips}
        deadline={deadline}
      />
    ) : undefined
  }, [
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
  ])
}

function useConfirmButtonText(
  disableConfirm: boolean,
  inputCurrencyInfo: CurrencyPreviewInfo,
  confirmText: string,
): string {
  return useMemo(() => {
    if (disableConfirm) {
      const { amount } = inputCurrencyInfo
      return `Insufficient ${amount?.currency?.symbol || 'token'} balance`
    }
    return confirmText
  }, [confirmText, disableConfirm, inputCurrencyInfo])
}

function useConfirmClickEvent(params: {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
  account: string | undefined
  ensName: string | undefined
  chainId: number | undefined
}): string | undefined {
  const { inputAmount, outputAmount, account, ensName, chainId } = params

  return useMemo(
    () =>
      buildSwapConfirmEvent({
        chainId,
        inputAmount,
        outputAmount,
        account,
        ensName,
      }),
    [chainId, inputAmount, outputAmount, account, ensName],
  )
}

function useConfirmEventAmounts(params: {
  shouldDisplayBridgeDetails: boolean
  bridgeContext: ReturnType<typeof useQuoteBridgeContext>
  inputCurrencyAmount: CurrencyPreviewInfo['amount']
  outputCurrencyAmount: CurrencyPreviewInfo['amount']
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}): {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
} {
  const { shouldDisplayBridgeDetails, bridgeContext, inputCurrencyAmount, outputCurrencyAmount, receiveAmountInfo } =
    params

  return useMemo(() => {
    if (shouldDisplayBridgeDetails) {
      const inputAmount = bridgeContext?.sellAmount ?? inputCurrencyAmount ?? null
      const outputAmount = bridgeContext?.buyAmount ?? outputCurrencyAmount ?? null
      return { inputAmount, outputAmount }
    }

    const slippageAmounts = receiveAmountInfo?.afterSlippage
    const inputAmount = slippageAmounts?.sellAmount ?? inputCurrencyAmount ?? null
    const outputAmount = slippageAmounts?.buyAmount ?? outputCurrencyAmount ?? null

    return { inputAmount, outputAmount }
  }, [shouldDisplayBridgeDetails, bridgeContext, inputCurrencyAmount, outputCurrencyAmount, receiveAmountInfo])
}

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
