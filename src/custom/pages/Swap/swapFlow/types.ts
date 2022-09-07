import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { SwapConfirmManager } from 'pages/Swap/hooks/useSwapConfirmManager'
import { PostOrderParams } from 'utils/trade'
import { AddOrderCallback } from 'state/orders/hooks'
import { GPv2Settlement } from 'abis/types'
import { AppDispatch } from 'state'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SwapFlowAnalyticsContext } from 'pages/Swap/swapFlow/steps/analytics'

export interface SwapFlowContext {
  context: {
    chainId: number
    trade: TradeGp
    inputAmountWithSlippage: CurrencyAmount<Currency>
    outputAmountWithSlippage: CurrencyAmount<Currency>
    priceImpact?: Percent
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
  postOrderParams: PostOrderParams
  settlementContract: GPv2Settlement
  appDataInfo: AppDataInfo
}
