import {
  isSolanaAddress,
  isSolanaChain,
  OrderKind,
  PriceQuality,
  QuoteAndPost,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import {
  TradeTypeToUiOrderType,
  useDerivedTradeState,
  useGetReceiveAmountInfo,
  useTradeConfirmActions,
  useTradeTypeInfo,
} from 'modules/trade'
import { getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { TradeFlowParams } from './useTradeFlowContext'

import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

interface SolanaTradeFlowContextParams {
  chainId: SupportedChainId
  account: string | null | undefined
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
  quote: QuoteAndPost | null
  priceQuality: PriceQuality | undefined
  uiOrderType: UiOrderType | null
  orderKind: OrderKind | undefined
  validTo: number
}

export function getIsSolanaTradeFlowContextReady(params: SolanaTradeFlowContextParams): boolean {
  const { chainId, account, inputAmount, outputAmount, quote, priceQuality, uiOrderType, orderKind, validTo } = params

  return Boolean(
    isSolanaChain(chainId) &&
      isSolanaAddress(account) &&
      inputAmount &&
      outputAmount &&
      quote &&
      priceQuality === PriceQuality.OPTIMAL &&
      uiOrderType &&
      orderKind &&
      validTo > 0,
  )
}

export function useSolanaTradeFlowContext({ deadline }: TradeFlowParams): SolanaTradeFlowContext | null {
  const { chainId, account } = useWalletInfo()
  const derivedTradeState = useDerivedTradeState()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const tradeType = tradeTypeInfo?.tradeType
  const uiOrderType = tradeType ? TradeTypeToUiOrderType[tradeType] : null
  const tradeQuoteState = useTradeQuote()
  const closeModals = useCloseModals()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()
  const addTransaction = useTransactionAdder()

  const { sellAmount: inputAmount, buyAmount: outputAmount } = receiveAmountInfo?.amountsToSign ?? {}
  const { recipient, recipientAddress, orderKind } = derivedTradeState || {}

  const validTo = getOrderValidTo(deadline, tradeQuoteState)

  const isReady = getIsSolanaTradeFlowContextReady({
    chainId,
    account,
    inputAmount,
    outputAmount,
    quote: tradeQuoteState.quote,
    priceQuality: tradeQuoteState.fetchParams?.priceQuality,
    uiOrderType,
    orderKind,
    validTo,
  })

  return (
    useSWR(
      isReady
        ? [
            account as string,
            chainId,
            tradeQuoteState.quote as QuoteAndPost,
            inputAmount as CurrencyAmount<Currency>,
            outputAmount as CurrencyAmount<Currency>,
            uiOrderType as UiOrderType,
            orderKind as OrderKind,
            validTo,
            recipient,
            recipientAddress,
            closeModals,
            dispatch,
            addTransaction,
            tradeConfirmActions,
          ]
        : null,
      ([
        account,
        chainId,
        tradeQuote,
        inputAmount,
        outputAmount,
        uiOrderType,
        orderKind,
        validTo,
        recipient,
        recipientAddress,
        closeModals,
        dispatch,
        addTransaction,
        tradeConfirmActions,
      ]) => ({
        tradeQuote,
        account,
        context: { chainId, inputAmount, outputAmount, orderKind, validTo },
        callbacks: { closeModals, dispatch, addTransaction },
        tradeConfirmActions,
        swapFlowAnalyticsContext: {
          account,
          recipient,
          recipientAddress,
          marketLabel: [inputAmount.currency.symbol, outputAmount.currency.symbol].join(','),
          orderType: uiOrderType,
          isBridgeOrder: false,
        },
      }),
    ).data || null
  )
}
