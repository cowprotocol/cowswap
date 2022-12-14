import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { SwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { PostOrderParams } from 'utils/trade'
import { AddOrderCallback } from 'state/orders/hooks'
import { CoWSwapEthFlow, GPv2Settlement } from '@cow/abis/types'
import { AppDispatch } from 'state'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SwapFlowAnalyticsContext } from '@cow/modules/swap/services/common/steps/analytics'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

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
}
