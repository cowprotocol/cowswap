import { GPv2Settlement, CoWSwapEthFlow } from '@cowswap/abis'
import { Erc20, Weth } from '@cowswap/abis'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { AppDispatch } from 'legacy/state'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { AddOrderCallback } from 'legacy/state/orders/hooks'
import TradeGp from 'legacy/state/swap/TradeGp'
import { PostOrderParams } from 'legacy/utils/trade'

import { AppDataInfo, UploadAppDataParams } from 'modules/appData'
import { SwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { SwapFlowAnalyticsContext } from 'modules/trade/utils/analytics'

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
    isGnosisSafeWallet: boolean
  }
  callbacks: {
    closeModals: () => void
    addOrderCallback: AddOrderCallback
    uploadAppData: (params: UploadAppDataParams) => void
  }
  dispatch: AppDispatch
  swapFlowAnalyticsContext: SwapFlowAnalyticsContext
  swapConfirmManager: SwapConfirmManager
  orderParams: PostOrderParams
  appDataInfo: AppDataInfo
}

export type SwapFlowContext = BaseFlowContext & {
  contract: GPv2Settlement
}

export type EthFlowContext = BaseFlowContext & {
  contract: CoWSwapEthFlow
  addTransaction: ReturnType<typeof useTransactionAdder>
  checkInFlightOrderIdExists: (orderId: string) => boolean
  addInFlightOrderId: (orderId: string) => void
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
