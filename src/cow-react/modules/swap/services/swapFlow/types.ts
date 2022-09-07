import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import TradeGp from 'state/swap/TradeGp'
import { SwapConfirmManager } from '@cow/modules/swap/hooks/useSwapConfirmManager'
import { EthFlowOrderParams, PostOrderParams } from 'utils/trade'
import { AddEthFlowOrderCallback, AddOrderCallback } from 'state/orders/hooks'
import { GPv2Settlement } from '@cow/abis/types'
import { AppDispatch } from 'state'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import { SwapFlowAnalyticsContext } from '@cow/modules/swap/services/swapFlow/steps/analytics'
import { CoWSwapEthFlow } from '@cow/abis/types/ethflow'

type CommonFlowContext = {
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
    addAppDataToUploadQueue: (params: AddAppDataToUploadQueueParams) => void
  }
  dispatch: AppDispatch
  swapConfirmManager: SwapConfirmManager
  appDataInfo: AppDataInfo
}

export type SwapFlowContext = CommonFlowContext & {
  callbacks: {
    addOrderCallback: AddOrderCallback
  }
  swapFlowAnalyticsContext: SwapFlowAnalyticsContext
  orderParams: PostOrderParams
  contract: GPv2Settlement
}

export type EthFlowContext = CommonFlowContext & {
  callbacks: {
    addOrderCallback: AddEthFlowOrderCallback
  }
  swapFlowAnalyticsContext: SwapFlowAnalyticsContext
  orderParams: EthFlowOrderParams
  contract: CoWSwapEthFlow
}
