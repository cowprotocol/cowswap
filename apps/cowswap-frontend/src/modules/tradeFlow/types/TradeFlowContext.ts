import { QuoteAndPost } from '@cowprotocol/cow-sdk'
import type { Erc20, Weth } from '@cowprotocol/cowswap-abis'
import type { Command } from '@cowprotocol/types'
import { BridgeOrderData, BridgeQuoteAmounts } from '@cowprotocol/types'
import type { SendBatchTxCallback } from '@cowprotocol/wallet'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { SigningSteps } from 'entities/trade'

import type { AppDispatch } from 'legacy/state'
import type { PostOrderParams } from 'legacy/utils/trade'

import type { TypedAppDataHooks } from 'modules/appData'
import type { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeConfirmActions } from 'modules/trade'
import type { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import type { TradeQuoteState } from 'modules/tradeQuote'

import type { SettlementContractData } from 'common/hooks/useContract'

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
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
  contract: Omit<SettlementContractData, 'chainId'>
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  permitAmountToSign?: bigint
  typedHooks?: TypedAppDataHooks
}

export interface SafeBundleFlowContext {
  spender: string
  sendBatchTransactions: SendBatchTxCallback
  wrappedNativeContract: Weth
  needsApproval: boolean
  erc20Contract: Erc20
  amountToApprove: CurrencyAmount<Currency>
}
