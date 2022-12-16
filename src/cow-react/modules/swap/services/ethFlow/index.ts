import { EthFlowContext } from '@cow/modules/swap/services/types'
import { tradeFlowAnalytics } from '@cow/modules/trade/utils/analytics'
import { signEthFlowOrderStep } from '@cow/modules/swap/services/ethFlow/steps/signEthFlowOrderStep'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/trade/utils/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'
import { addPendingOrderStep } from '@cow/modules/trade/utils/addPendingOrderStep'
import { calculateUniqueOrderId } from './steps/calculateUniqueOrderId'

export async function ethFlow(input: EthFlowContext, priceImpactParams: PriceImpact): Promise<void> {
  const {
    swapFlowAnalyticsContext,
    context,
    swapConfirmManager,
    contract,
    callbacks,
    appDataInfo,
    dispatch,
    orderParams: orderParamsOriginal,
  } = input

  logTradeFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) {
    return undefined
  }

  logTradeFlow('ETH FLOW', 'STEP 2: send transaction')
  // TODO: check if we need own eth flow analytics or more generic
  tradeFlowAnalytics.swap(swapFlowAnalyticsContext)
  swapConfirmManager.sendTransaction(context.trade)

  logTradeFlow('ETH FLOW', 'STEP 3: Get Unique Order Id (prevent collisions)')
  const { orderId, orderParams } = await calculateUniqueOrderId(orderParamsOriginal, contract)

  try {
    logTradeFlow('ETH FLOW', 'STEP 4: sign order')
    const { order, txReceipt } = await signEthFlowOrderStep(orderId, orderParams, contract).finally(() => {
      callbacks.closeModals()
    })

    logTradeFlow('ETH FLOW', 'STEP 5: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order,
      },
      dispatch
    )
    // TODO: maybe move this into addPendingOrderStep?
    input.addTransaction({ hash: txReceipt.hash, ethFlow: { orderId: order.id, subType: 'creation' } })

    logTradeFlow('ETH FLOW', 'STEP 6: add app data to upload queue')
    callbacks.addAppDataToUploadQueue({ chainId: context.chainId, orderId, appData: appDataInfo })

    logTradeFlow('ETH FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    swapConfirmManager.transactionSent(orderId)
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)
  } catch (error) {
    logTradeFlow('ETH FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
