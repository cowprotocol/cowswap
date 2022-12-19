import { PostOrderParams, signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from '@cow/modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from '@cow/modules/trade/utils/addPendingOrderStep'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AppDispatch } from 'state'
import { GPv2Settlement } from '@cow/abis/types'
import { PriceImpact } from 'hooks/usePriceImpact'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from '@cow/modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { Web3Provider } from '@ethersproject/providers'
import { AddAppDataToUploadQueueParams, AppDataInfo } from 'state/appData/types'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { LOW_RATE_THRESHOLD_PERCENT } from '@cow/modules/limitOrders/const/trade'
import { tradeFlowAnalytics } from '@cow/modules/trade/utils/analytics'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { SwapFlowAnalyticsContext } from '@cow/modules/trade/utils/analytics'
import { getSwapErrorMessage } from '@cow/modules/trade/utils/swapErrorHelper'
import { OrderClass } from 'custom/state/orders/actions'

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

export class PriceImpactDeclineError extends Error {}

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  beforeTrade?: () => void
): Promise<string | null> {
  const { account, recipientAddressOrName, sellToken, buyToken } = params.postOrderParams
  const marketLabel = [sellToken.symbol, buyToken.symbol].join(',')
  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient: recipientAddressOrName,
    recipientAddress: recipientAddressOrName,
    marketLabel,
    orderClass: OrderClass.LIMIT,
  }

  logTradeFlow('LIMIT ORDER FLOW', 'STEP 1: confirm price impact')
  const isTooLowRate = params.rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !confirmPriceImpactWithoutFee(priceImpact.priceImpact)) {
    throw new PriceImpactDeclineError()
  }

  logTradeFlow('LIMIT ORDER FLOW', 'STEP 2: send transaction')
  tradeFlowAnalytics.swap(swapFlowAnalyticsContext)
  beforeTrade?.()

  const validTo = calculateLimitOrdersDeadline(settingsState)

  try {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 3: sign and post order')
    const { id: orderId, order } = await signAndPostOrder({
      ...params.postOrderParams,
      signer: params.provider.getSigner(),
      validTo,
    })

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 4: presign order (optional)')
    const presignTx = await (params.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, params.settlementContract))

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 5: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: params.chainId,
        order: {
          ...order,
          presignGnosisSafeTxHash: params.isGnosisSafeWallet && presignTx ? presignTx.hash : undefined,
        },
      },
      params.dispatch
    )

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 6: add app data to upload queue')
    params.addAppDataToUploadQueue({ chainId: params.chainId, orderId, appData: params.appData })

    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return orderId
  } catch (error) {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
