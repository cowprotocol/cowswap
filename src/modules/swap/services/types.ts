import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { SwapConfirmManager } from 'modules/swap/hooks/useSwapConfirmManager'
import { PostOrderParams } from 'utils/trade'
import { AddOrderCallback } from 'state/orders/hooks'
import { GPv2Settlement } from 'abis/types'
import { CoWSwapEthFlow } from 'abis/types/ethflow'
import { Erc20 } from 'legacy/abis/types'
import { AppDispatch } from 'state'
import { UploadAppDataParams, AppDataInfo } from 'modules/appData'
import { SwapFlowAnalyticsContext } from 'modules/trade/utils/analytics'
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

export type SafeBundleFlowContext = BaseFlowContext & {
  erc20Contract: Erc20
  settlementContract: GPv2Settlement
  addTransaction: ReturnType<typeof useTransactionAdder>
  spender: string
  safeAppsSdk: SafeAppsSDK
  provider: Web3Provider
}
