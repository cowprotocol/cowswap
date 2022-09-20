import { SwapFlowContext } from './types'
import { swapFlowAnalytics } from './steps/analytics'
import { signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from './steps/presignOrderStep'
import { addPendingOrderStep } from 'pages/Swap/swapFlow/steps/addPendingOrderStep'
import confirmPriceImpactWithoutFee from '@uni_src/components/swap/confirmPriceImpactWithoutFee'
import { logSwapFlow } from 'pages/Swap/swapFlow/logger'
import { getSwapErrorMessage } from 'pages/Swap/swapFlow/steps/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'

export async function swapFlow(input: SwapFlowContext, priceImpactParams: PriceImpact) {
  logSwapFlow('STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) return

  logSwapFlow('STEP 2: send transaction')
  swapFlowAnalytics.swap(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logSwapFlow('STEP 3: sign and post order')
    const { id: orderId, order } = await signAndPostOrder(input.postOrderParams).finally(() => {
      input.callbacks.closeModals()
    })

    logSwapFlow('STEP 4: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, input.settlementContract))

    logSwapFlow('STEP 5: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order: {
          ...order,
          presignGnosisSafeTxHash: input.flags.isGnosisSafeWallet && presignTx ? presignTx.hash : undefined,
        },
      },
      input.dispatch
    )

    logSwapFlow('STEP 6: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logSwapFlow('STEP 7: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error) {
    logSwapFlow('STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
