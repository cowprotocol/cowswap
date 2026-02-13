import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Erc20 } from '@cowprotocol/cowswap-abis'
import type { SendBatchTxCallback } from '@cowprotocol/wallet'

import { AppDispatch } from 'legacy/state'
import { PostOrderParams } from 'legacy/utils/trade'

import { TypedAppDataHooks } from 'modules/appData'
import { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeQuoteState } from 'modules/tradeQuote'

import type { SettlementContractData } from 'common/hooks/useContract'

import type { Config } from 'wagmi'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'config'>
  typedHooks?: TypedAppDataHooks
  settlementContract: Omit<SettlementContractData, 'chainId'>
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  config: Config
  allowsOffchainSigning: boolean
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  getCachedPermit: ReturnType<typeof useGetCachedPermit>
  quoteState: TradeQuoteState
}

export interface SafeBundleFlowContext extends TradeFlowContext {
  erc20Contract: Erc20
  spender: string
  sendBatchTransactions: SendBatchTxCallback
}

export class PriceImpactDeclineError extends Error {}
