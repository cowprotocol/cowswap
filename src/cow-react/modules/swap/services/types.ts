import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { SwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { PostOrderParams } from 'utils/trade'
import { AddOrderCallback } from 'state/orders/hooks'
import { CoWSwapEthFlow, Erc20, GPv2Settlement } from '@cow/abis/types'
import { AppDispatch } from 'state'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SwapFlowAnalyticsContext } from '@cow/modules/trade/utils/analytics'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { Web3Provider } from '@ethersproject/providers'
import SafeAppsSDK from '@safe-global/safe-apps-sdk'

export interface BaseFlowContext {
  context: {
    chainId: number
    trade: TradeGp
    inputAmountWithSlippage: CurrencyAmount<Currency>
    outputAmountWithSlippage: CurrencyAmount<Currency>
  }
  flags: {
    allowsOffchainSigning: boolean
    isGnosisSafeWallet: boolean
  }
  callbacks: {
    closeModals: () => void
    addOrderCallback: AddOrderCallback
    addAppDataToUploadQueue: (params: AddAppDataToUploadQueueParams) => void
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

export type SafeBundleFlowContext = BaseFlowContext & {
  erc20Contract: Erc20
  settlementContract: GPv2Settlement
  addTransaction: ReturnType<typeof useTransactionAdder>
  spender: string
  safeAppsSdk: SafeAppsSDK
  provider: Web3Provider
}
