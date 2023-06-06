import { OrderClass } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { presignOrderStep } from 'modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { SwapFlowAnalyticsContext } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
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

  if (!isTooLowRate && priceImpact.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact.priceImpact))) {
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
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 4: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: params.chainId,
        order: {
          ...order,
          isHidden: !params.allowsOffchainSigning,
        },
      },
      params.dispatch
    )

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 5: presign order (optional)')
    const presignTx = await (params.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, params.settlementContract))

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTx) {
      partialOrderUpdate(
        {
          chainId: params.chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: params.isGnosisSafeWallet ? presignTx.hash : undefined,
            isHidden: false,
          },
        },
        params.dispatch
      )
    }

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 7: add app data to upload queue')
    params.uploadAppData({ chainId: params.chainId, orderId, appData: params.appData })

    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return orderId
  } catch (error: any) {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
