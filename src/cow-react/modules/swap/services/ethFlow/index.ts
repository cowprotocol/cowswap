import { EthFlowContext } from '@cow/modules/swap/services/common/types'
import { swapFlowAnalytics } from '@cow/modules/swap/services/common/steps/analytics'
import { signEthFlowOrderStep } from '@cow/modules/swap/services/ethFlow/steps/signEthFlowOrderStep'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logSwapFlow } from '@cow/modules/swap/services/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/swap/services/common/steps/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'
import { addPendingOrderStep } from '@cow/modules/swap/services/common/steps/addPendingOrderStep'

export async function ethFlow(input: EthFlowContext, priceImpactParams: PriceImpact): Promise<void> {
  logSwapFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) return

  logSwapFlow('ETH FLOW', 'STEP 2: send transaction')
  // TODO: check if we need own eth flow analytics or more generic
  swapFlowAnalytics.swap(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logSwapFlow('ETH FLOW', 'STEP 3: sign order')
    const { order, orderId, txReceipt } = await signEthFlowOrderStep(input.orderParams, input.contract).finally(() => {
      input.callbacks.closeModals()
    })

    logSwapFlow('ETH FLOW', 'STEP 4: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order,
      },
      input.dispatch
    )
    // TODO: maybe move this into addPendingOrderStep?
    input.addTransaction({ hash: txReceipt.hash, ethFlow: { orderId: order.id, subType: 'creation' } })

    logSwapFlow('ETH FLOW', 'STEP 5: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logSwapFlow('ETH FLOW', 'STEP 6: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error) {
    logSwapFlow('ETH FLOW', 'STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
