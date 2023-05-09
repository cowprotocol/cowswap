import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { SafeBundleFlowContext } from '@cow/modules/swap/services/types'
import { buildApproveTx } from '@cow/modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from '@cow/modules/operations/bundle/buildPresignTx'
import { getSwapErrorMessage } from '@cow/modules/trade/utils/swapErrorHelper'
import { addPendingOrderStep } from '@cow/modules/trade/utils/addPendingOrderStep'
import { PriceImpact } from 'hooks/usePriceImpact'
import { signAndPostOrder } from 'utils/trade'

const LOG_PREFIX = 'SAFE BUNDLE FLOW'

export async function safeBundleFlow(
  input: SafeBundleFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
): Promise<void> {
  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')

  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return
  }

  try {
    // For now, bundling ALWAYS includes 2 steps: approve and presign.
    // In the feature users will be able to sort/add steps as they see fit
    logTradeFlow(LOG_PREFIX, 'STEP 2: build approval tx')
    const approveTx = await buildApproveTx({
      erc20Contract: input.erc20Contract,
      spender: input.spender,
      amountToApprove: input.context.trade.inputAmount,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 3: post order')
    const { id: orderId, order } = await signAndPostOrder(input.orderParams).finally(() => {
      input.callbacks.closeModals()
    })

    logTradeFlow(LOG_PREFIX, 'STEP 4: build presign tx')
    const presignTx = await buildPresignTx({ settlementContract: input.settlementContract, orderId })

    logTradeFlow(LOG_PREFIX, 'STEP 5: send safe tx')
    const safeTransactionData: MetaTransactionData[] = [
      { to: approveTx.to!, data: approveTx.data!, value: '0', operation: 0 },
      { to: presignTx.to!, data: presignTx.data!, value: '0', operation: 0 },
    ]

    const safeTx = await input.safeAppsSdk.txs.send({ txs: safeTransactionData })

    logTradeFlow(LOG_PREFIX, 'STEP 6: add tx to store')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order: {
          ...order,
          presignGnosisSafeTxHash: safeTx.safeTxHash,
        },
      },
      input.dispatch
    )

    logTradeFlow(LOG_PREFIX, 'STEP 7: add app data to upload queue')
    input.callbacks.addAppDataToUploadQueue({ chainId: input.context.chainId, orderId, appData: input.appDataInfo })

    logTradeFlow(LOG_PREFIX, 'STEP 8: show UI of the successfully sent transaction')
    input.swapConfirmManager.transactionSent(orderId)
  } catch (error) {
    logTradeFlow(LOG_PREFIX, 'STEP 9: error', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    // TODO: handle analytics
    // tradeFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
