import { EthFlowContext } from '@cow/modules/swap/services/swapFlow/types'
import { swapFlowAnalytics } from '@cow/modules/swap/services/swapFlow/steps/analytics'
import { signEthFlowOrderStep } from '@cow/modules/swap/services/ethFlow/steps/signEthFlowOrderStep'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logSwapFlow } from '@cow/modules/swap/services/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/swap/services/common/steps/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'
import { addPendingEthFLowOrderStep } from '@cow/modules/swap/services/ethFlow/steps/addPendingEthFLowOrderStep'

export async function ethFlow(input: EthFlowContext, priceImpactParams: PriceImpact) {
  logSwapFlow('STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) return

  logSwapFlow('STEP 2: send transaction')
  // TODO: check
  swapFlowAnalytics.swap(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logSwapFlow('STEP 3: sign and post order')
    // TODO: fix
    const { order, orderId } = await signEthFlowOrderStep(input.orderParams, input.contract).finally(() => {
      input.callbacks.closeModals()
    })

    logSwapFlow('STEP 4: add pending order step')
    addPendingEthFLowOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order: {
          ...order,
          // TODO: review
          presignGnosisSafeTxHash: undefined,
        },
      },
      input.dispatch
    )

    logSwapFlow('STEP 5: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logSwapFlow('STEP 6: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error) {
    logSwapFlow('STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
