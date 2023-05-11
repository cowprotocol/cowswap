import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { PostOrderParams } from 'utils/trade'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AppDispatch } from 'state'
import { Erc20, GPv2Settlement } from '@cow/abis/types'
import { Web3Provider } from '@ethersproject/providers'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'

export interface TradeFlowContext {
  // signer changes creates redundant re-renders
  // validTo must be calculated just before signing of an order
  postOrderParams: Omit<PostOrderParams, 'validTo' | 'signer'>
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  rateImpact: number
  appData: AppDataInfo
  addAppDataToUploadQueue: (update: AddAppDataToUploadQueueParams) => void
  provider: Web3Provider
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
}

export interface SafeBundleFlowContext extends TradeFlowContext {
  erc20Contract: Erc20
  spender: string
  safeAppsSdk: SafeAppsSDK
}

export class PriceImpactDeclineError extends Error {}
