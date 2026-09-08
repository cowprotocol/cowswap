import type { Config } from 'wagmi'

import type { TokenWithLogo } from '@cowprotocol/common-const'
import { OrderKind, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Currency, CurrencyAmount } from '@cowprotocol/currency'
import type { SolanaQuote } from '@cowprotocol/sdk-trading-solana'
import type { Command } from '@cowprotocol/types'
import { BridgeOrderData, BridgeQuoteAmounts } from '@cowprotocol/types'
import type { SendBatchTxCallback } from '@cowprotocol/wallet'

import { SigningSteps } from 'entities/trade'

import type { AppDispatch } from 'legacy/state'
import type { TransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import type { PostOrderParams } from 'legacy/utils/trade'

import type { TypedAppDataHooks } from 'modules/appData'
import type { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeConfirmActions } from 'modules/trade'
import type { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import type { TradeQuoteState } from 'modules/tradeQuote'

import type { WethContractData } from 'common/hooks/useContract'

import type { Provider as SolanaProvider } from '@reown/appkit-adapter-solana/react'
import type { Connection, PublicKey } from '@solana/web3.js'

export interface SafeBundleFlowContext {
  spender: string
  sendBatchTransactions: SendBatchTxCallback
  wrappedNativeContract: WethContractData
  needsApproval: boolean
  tokenAddress: string
  amountToApprove: CurrencyAmount<Currency>
  maximumSendSellAmount: CurrencyAmount<Currency>
}

export interface SolanaTradeFlowContext {
  tradeQuote: QuoteAndPost
  // Carries the order intent/PDA the `CreateOrder` instruction is built from.
  solanaQuote: SolanaQuote
  account: string
  // Everything needed to bundle and send the flow's instructions as one transaction.
  solana: {
    connection: Connection
    provider: SolanaProvider
    owner: PublicKey
  }
  // The sell token and its exact amount, driving the wrap and delegate steps.
  sellToken: TokenWithLogo
  sellAmount: bigint
  // Already-delegated amount for `sellToken`; the delegate step is skipped when it covers `delegationAmount`.
  currentDelegation: bigint
  // How much to delegate, from the partial/full approval switcher — not necessarily `sellAmount`.
  delegationAmount: bigint
  context: {
    chainId: SupportedChainId
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
    orderKind: OrderKind
    validTo: number
  }
  callbacks: {
    closeModals: Command
    dispatch: AppDispatch
    addTransaction: TransactionAdder
  }
  tradeConfirmActions: TradeConfirmActions
  swapFlowAnalyticsContext: TradeFlowAnalyticsContext
}

export interface TradeFlowContext {
  tradeQuote: QuoteAndPost
  tradeQuoteState: TradeQuoteState
  bridgeQuoteAmounts: BridgeQuoteAmounts | null
  context: {
    chainId: number
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
  }
  flags: {
    allowsOffchainSigning: boolean
  }
  callbacks: {
    closeModals: Command
    getCachedPermit: ReturnType<typeof useGetCachedPermit>
    dispatch: AppDispatch
    addBridgeOrder: (order: BridgeOrderData) => void
    setSigningStep(stepNumber: string, step: SigningSteps): void
  }
  tradeConfirmActions: TradeConfirmActions
  swapFlowAnalyticsContext: TradeFlowAnalyticsContext
  orderParams: PostOrderParams
  config: Config
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  permitAmountToSign?: bigint
  typedHooks?: TypedAppDataHooks
}

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
  SOLANA_SWAP = 'SOLANA_SWAP',
}
