import { CoWSwapEthFlow, Erc20, GPv2Settlement, Weth } from '@cowprotocol/abis'
import { Command } from '@cowprotocol/types'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { AppDispatch } from 'legacy/state'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { AddOrderCallback } from 'legacy/state/orders/hooks'
import type { QuoteInformationObject } from 'legacy/state/price/reducer'
import TradeGp from 'legacy/state/swap/TradeGp'
import { PostOrderParams } from 'legacy/utils/trade'

import { AppDataInfo, UploadAppDataParams } from 'modules/appData'
import { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import { TradeConfirmActions } from 'modules/trade'
import { TradeFlowAnalyticsContext } from 'modules/trade/utils/analytics'

import { EthFlowOrderExistsCallback } from '../hooks/useCheckEthFlowOrderExists'
import { FlowType } from '../hooks/useFlowContext'
export interface BaseFlowContext {
  context: {
    chainId: number
    trade: TradeGp
    inputAmountWithSlippage: CurrencyAmount<Currency>
    outputAmountWithSlippage: CurrencyAmount<Currency>
    flowType: FlowType
  }
  flags: {
    allowsOffchainSigning: boolean
  }
  callbacks: {
    closeModals: Command
    addOrderCallback: AddOrderCallback
    uploadAppData: (params: UploadAppDataParams) => void
    getCachedPermit: ReturnType<typeof useGetCachedPermit>
  }
  sellTokenContract: Erc20 | null
  dispatch: AppDispatch
  swapFlowAnalyticsContext: TradeFlowAnalyticsContext
  orderParams: PostOrderParams
  appDataInfo: AppDataInfo
  tradeConfirmActions: TradeConfirmActions
  quote: QuoteInformationObject | undefined
}

export type SwapFlowContext = BaseFlowContext & {
  contract: GPv2Settlement
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
}

export type EthFlowContext = BaseFlowContext & {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
  addInFlightOrderId: (orderId: string) => void
  quote: QuoteInformationObject | undefined
}

export type BaseSafeFlowContext = BaseFlowContext & {
  settlementContract: GPv2Settlement
  spender: string
  safeAppsSdk: SafeAppsSDK
  provider: Web3Provider
}

export type SafeBundleApprovalFlowContext = BaseSafeFlowContext & {
  erc20Contract: Erc20
}

export type SafeBundleEthFlowContext = BaseSafeFlowContext & {
  wrappedNativeContract: Weth
  needsApproval: boolean
}
