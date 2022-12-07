import { SwapFlowContext } from '../common/types'
import { swapFlowAnalytics } from '../common/steps/analytics'
import { signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from './steps/presignOrderStep'
import { addPendingOrderStep } from '@cow/modules/swap/services/common/steps/addPendingOrderStep'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logSwapFlow } from '@cow/modules/swap/services/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/swap/services/common/steps/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'

export async function swapFlow(input: SwapFlowContext, priceImpactParams: PriceImpact) {
  logSwapFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) return

  logSwapFlow('SWAP FLOW', 'STEP 2: send transaction')
  swapFlowAnalytics.swap(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logSwapFlow('SWAP FLOW', 'STEP 3: sign and post order')
    const { id: orderId, order } = await signAndPostOrder(input.orderParams).finally(() => {
      input.callbacks.closeModals()
    })

    logSwapFlow('SWAP FLOW', 'STEP 4: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, input.contract))

    logSwapFlow('SWAP FLOW', 'STEP 5: add pending order step')
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

    logSwapFlow('SWAP FLOW', 'STEP 6: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logSwapFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error) {
    logSwapFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
