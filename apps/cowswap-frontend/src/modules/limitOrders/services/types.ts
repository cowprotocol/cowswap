import { Erc20, GPv2Settlement } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'

import { AppDispatch } from 'legacy/state'
import { PostOrderParams } from 'legacy/utils/trade'

import { GeneratePermitHook, IsTokenPermittableResult } from 'modules/permit'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'signer'>
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  provider: Web3Provider
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
}

export interface SafeBundleFlowContext extends TradeFlowContext {
  erc20Contract: Erc20
  spender: string
  safeAppsSdk: SafeAppsSDK
}

export class PriceImpactDeclineError extends Error {}
