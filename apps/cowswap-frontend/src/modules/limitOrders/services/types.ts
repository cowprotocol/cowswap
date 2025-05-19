import { Erc20, GPv2Settlement } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SendBatchTxCallback } from '@cowprotocol/wallet'
import type { JsonRpcSigner } from '@ethersproject/providers'

import { AppDispatch } from 'legacy/state'
import { PostOrderParams } from 'legacy/utils/trade'

import { TypedAppDataHooks } from 'modules/appData'
import { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeQuoteState } from 'modules/tradeQuote'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'signer'>
  typedHooks?: TypedAppDataHooks
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  signer: JsonRpcSigner
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
