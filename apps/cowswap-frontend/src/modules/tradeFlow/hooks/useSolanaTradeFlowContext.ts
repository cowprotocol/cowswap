import { isSolanaAddress, isSolanaChain, OrderKind, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { Command, UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDispatch } from 'react-redux'
import useSWR from 'swr'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { TransactionAdder, useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import {
  TradeConfirmActions,
  TradeTypeToUiOrderType,
  useDerivedTradeState,
  useGetReceiveAmountInfo,
  useTradeConfirmActions,
  useTradeTypeInfo,
} from 'modules/trade'
import { getIsFinalQuote, getOrderValidTo, useTradeQuote } from 'modules/tradeQuote'

import { TradeFlowParams } from './useTradeFlowContext'

import { SolanaTradeFlowContext } from '../types/TradeFlowContext'

interface SolanaTradeFlowContextParams {
  chainId: SupportedChainId
  account: string | null | undefined
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
  quote: QuoteAndPost | null
  isFinalQuote: boolean
  uiOrderType: UiOrderType | null
  orderKind: OrderKind | undefined
  validTo: number
}

type SolanaTradeFlowSwrKey = [
  account: string,
  chainId: SupportedChainId,
  tradeQuote: QuoteAndPost,
  inputAmount: CurrencyAmount<Currency>,
  outputAmount: CurrencyAmount<Currency>,
  uiOrderType: UiOrderType,
  orderKind: OrderKind,
  validTo: number,
  recipient: string | null | undefined,
  recipientAddress: string | null | undefined,
  closeModals: Command,
  dispatch: AppDispatch,
  addTransaction: TransactionAdder,
  tradeConfirmActions: TradeConfirmActions,
]

export function getIsSolanaTradeFlowContextReady(params: SolanaTradeFlowContextParams): boolean {
  const { chainId, account, inputAmount, outputAmount, quote, isFinalQuote, uiOrderType, orderKind, validTo } = params

  return Boolean(
    isSolanaChain(chainId) &&
      isSolanaAddress(account) &&
      inputAmount &&
      outputAmount &&
      quote &&
      isFinalQuote &&
      uiOrderType &&
      orderKind &&
      validTo > 0,
  )
}

// Mirrors swapFlow's `orderParams.recipient = recipientAddress || recipient || account`: prefer the
// resolved recipient address, then the raw recipient value, then default to sending to self.
export function resolveSolanaReceiver(params: {
  recipient: string | null | undefined
  recipientAddress: string | null | undefined
  account: string
}): string {
  return params.recipientAddress || params.recipient || params.account
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
    isFinalQuote: getIsFinalQuote(tradeQuoteState.fetchParams),
    uiOrderType,
    orderKind,
    validTo,
  })

  const swrKey: SolanaTradeFlowSwrKey | null =
    isReady && account
      ? [
          account,
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
      : null

  return useSWR(swrKey, buildSolanaTradeFlowContext).data || null
}

function buildSolanaTradeFlowContext([
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
]: SolanaTradeFlowSwrKey): SolanaTradeFlowContext {
  return {
    tradeQuote,
    account,
    context: {
      chainId,
      inputAmount,
      outputAmount,
      orderKind,
      validTo,
      receiver: resolveSolanaReceiver({ recipient, recipientAddress, account }),
    },
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
  }
}
