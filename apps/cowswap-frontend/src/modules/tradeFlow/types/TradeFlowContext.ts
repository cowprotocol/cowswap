import type { Erc20, GPv2Settlement, Weth } from '@cowprotocol/abis'
import { QuoteAndPost } from '@cowprotocol/cow-sdk'
import type { Command } from '@cowprotocol/types'
import type { SendBatchTxCallback } from '@cowprotocol/wallet'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import type { AppDispatch } from 'legacy/state'
import type { PostOrderParams } from 'legacy/utils/trade'

import type { TypedAppDataHooks } from 'modules/appData'
import type { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeConfirmActions } from 'modules/trade'
import type { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import type { TradeQuoteState } from 'modules/tradeQuote'

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
}

export interface TradeFlowContext {
  tradeQuote: QuoteAndPost
  tradeQuoteState: TradeQuoteState
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
  }
  tradeConfirmActions: TradeConfirmActions
  swapFlowAnalyticsContext: TradeFlowAnalyticsContext
  orderParams: PostOrderParams
  contract: GPv2Settlement
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  typedHooks?: TypedAppDataHooks
}

export interface SafeBundleFlowContext {
  spender: string
  sendBatchTransactions: SendBatchTxCallback
  wrappedNativeContract: Weth
  needsApproval: boolean
  erc20Contract: Erc20
}
