import { EthFlowContext } from '@cow/modules/swap/services/types'
import { swapFlowAnalytics } from '@cow/modules/trade/utils/analytics'
import { signEthFlowOrderStep } from '@cow/modules/swap/services/ethFlow/steps/signEthFlowOrderStep'
import confirmPriceImpactWithoutFee from 'components/swap/confirmPriceImpactWithoutFee'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { getSwapErrorMessage } from '@cow/modules/trade/utils/swapErrorHelper'
import { PriceImpact } from 'hooks/usePriceImpact'
import { addPendingOrderStep } from '@cow/modules/trade/utils/addPendingOrderStep'

export async function ethFlow(input: EthFlowContext, priceImpactParams: PriceImpact): Promise<void> {
  logTradeFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !confirmPriceImpactWithoutFee(priceImpactParams.priceImpact)) return

  logTradeFlow('ETH FLOW', 'STEP 2: send transaction')
  // TODO: check if we need own eth flow analytics or more generic
  swapFlowAnalytics.swap(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logTradeFlow('ETH FLOW', 'STEP 3: sign order')
    const { order, orderId } = await signEthFlowOrderStep(input.orderParams, input.contract).finally(() => {
      input.callbacks.closeModals()
    })

    logTradeFlow('ETH FLOW', 'STEP 4: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order,
      },
      input.dispatch
    )

    logTradeFlow('ETH FLOW', 'STEP 5: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logTradeFlow('ETH FLOW', 'STEP 6: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    swapFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error) {
    logTradeFlow('ETH FLOW', 'STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    swapFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
