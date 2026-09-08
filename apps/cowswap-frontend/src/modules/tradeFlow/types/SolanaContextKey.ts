import type { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'

import type { AppDispatch } from 'legacy/state'
import type { TransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import type { SolanaQuoteAndPost } from 'modules/tradeQuote'

import { SolanaTradeFlowContext } from './TradeFlowContext'

/** Doubles as the SWR key, hence the tuple: SWR hashes it by contents to decide when to rebuild. */
export type SolanaContextKey = readonly [
  account: string,
  chainId: SupportedChainId,
  tradeQuote: SolanaQuoteAndPost,
  inputAmount: CurrencyAmount<Currency>,
  outputAmount: CurrencyAmount<Currency>,
  uiOrderType: UiOrderType,
  orderKind: OrderKind,
  validTo: number,
  recipient: string | null | undefined,
  recipientAddress: string | null | undefined,
  closeModals: () => void,
  dispatch: AppDispatch,
  addTransaction: TransactionAdder,
  tradeConfirmActions: SolanaTradeFlowContext['tradeConfirmActions'],
  solana: SolanaTradeFlowContext['solana'],
  sellToken: TokenWithLogo,
  currentDelegation: bigint,
  delegationAmount: bigint,
]

/** The same dependencies before narrowing, as the hook reads them. */
export interface SolanaContextKeyParams {
  isReady: boolean
  account: string | null | undefined
  chainId: SupportedChainId
  quote: QuoteAndPost | null
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
  uiOrderType: UiOrderType | null
  orderKind: OrderKind | undefined
  validTo: number
  recipient: string | null | undefined
  recipientAddress: string | null | undefined
  closeModals: () => void
  dispatch: AppDispatch
  addTransaction: TransactionAdder
  tradeConfirmActions: SolanaTradeFlowContext['tradeConfirmActions']
  solana: SolanaTradeFlowContext['solana'] | null
  sellToken: TokenWithLogo | undefined
  currentDelegation: bigint | undefined
  delegationAmount: bigint
}

export interface SolanaTradeFlowContextParams {
  chainId: SupportedChainId
  account: string | null | undefined
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
  quote: QuoteAndPost | null
  isFinalQuote: boolean
  uiOrderType: UiOrderType | null
  orderKind: OrderKind | undefined
  validTo: number
  hasSolanaSigner: boolean
}
