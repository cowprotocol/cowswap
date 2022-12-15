import { EthFlowContext } from '@cow/modules/swap/services/common/types'
import { swapFlowAnalytics } from '@cow/modules/swap/services/common/steps/analytics'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logSwapFlow } from '@cow/modules/swap/services/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/swap/services/common/steps/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'
import { addPendingOrderStep } from '@cow/modules/swap/services/common/steps/addPendingOrderStep'
import { signEthFlowOrderStep } from './steps/signEthFlowOrderStep'
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

  logSwapFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) {
    return undefined
  }

  logSwapFlow('ETH FLOW', 'STEP 2: send transaction')
  // TODO: check if we need own eth flow analytics or more generic
  swapFlowAnalytics.swap(swapFlowAnalyticsContext)
  swapConfirmManager.sendTransaction(context.trade)

  logSwapFlow('ETH FLOW', 'STEP 3: Get Unique Order Id (prevent collisions)')
  const { orderId, orderParams } = await calculateUniqueOrderId(orderParamsOriginal, contract)

  try {
    logSwapFlow('ETH FLOW', 'STEP 4: sign order')
    const { order, txReceipt } = await signEthFlowOrderStep(orderId, orderParams, contract).finally(() => {
      callbacks.closeModals()
    })

    logSwapFlow('ETH FLOW', 'STEP 5: add pending order step')
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

    logSwapFlow('ETH FLOW', 'STEP 6: add app data to upload queue')
    callbacks.addAppDataToUploadQueue({ chainId: context.chainId, orderId, appData: appDataInfo })

    logSwapFlow('ETH FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(swapFlowAnalyticsContext)
  } catch (error) {
    logSwapFlow('ETH FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
