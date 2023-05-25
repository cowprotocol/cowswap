import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { SafeBundleFlowContext } from 'modules/swap/services/types'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from 'modules/operations/bundle/buildPresignTx'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { signAndPostOrder } from 'legacy/utils/trade'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { shouldZeroApprove as shouldZeroApproveFn } from 'common/hooks/useShouldZeroApprove/shouldZeroApprove'
import { buildZeroApproveTx } from 'modules/operations/bundle/buildZeroApproveTx'

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

  const {
    erc20Contract,
    spender,
    context,
    callbacks,
    swapConfirmManager,
    dispatch,
    appDataInfo,
    orderParams,
    settlementContract,
    safeAppsSdk,
    swapFlowAnalyticsContext,
  } = input

  tradeFlowAnalytics.approveAndPresign(swapFlowAnalyticsContext)

  try {
    // For now, bundling ALWAYS includes 2 steps: approve and presign.
    // In the feature users will be able to sort/add steps as they see fit
    logTradeFlow(LOG_PREFIX, 'STEP 2: build approval tx')
    const approveTx = await buildApproveTx({
      erc20Contract,
      spender,
      amountToApprove: context.trade.inputAmount,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 3: post order')
    const { id: orderId, order } = await signAndPostOrder(orderParams).finally(() => {
      callbacks.closeModals()
    })

    logTradeFlow(LOG_PREFIX, 'STEP 4: build presign tx')
    const presignTx = await buildPresignTx({ settlementContract, orderId })

    logTradeFlow(LOG_PREFIX, 'STEP 5: send safe tx')
    const safeTransactionData: MetaTransactionData[] = [
      { to: approveTx.to!, data: approveTx.data!, value: '0', operation: 0 },
      { to: presignTx.to!, data: presignTx.data!, value: '0', operation: 0 },
    ]

    const shouldZeroApprove = await shouldZeroApproveFn({
      tokenContract: erc20Contract,
      spender,
      amountToApprove: context.trade.inputAmount,
      isBundle: true,
    })

    if (shouldZeroApprove) {
      const zeroApproveTx = await buildZeroApproveTx({
        erc20Contract,
        spender,
        currency: context.trade.inputAmount.currency,
      })
      safeTransactionData.unshift({
        to: zeroApproveTx.to!,
        data: zeroApproveTx.data!,
        value: '0',
        operation: 0,
      })
    }

    const safeTx = await safeAppsSdk.txs.send({ txs: safeTransactionData })

    logTradeFlow(LOG_PREFIX, 'STEP 6: add tx to store')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order: {
          ...order,
          presignGnosisSafeTxHash: safeTx.safeTxHash,
        },
      },
      dispatch
    )
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    logTradeFlow(LOG_PREFIX, 'STEP 7: add app data to upload queue')
    callbacks.uploadAppData({ chainId: context.chainId, orderId, appData: appDataInfo })

    logTradeFlow(LOG_PREFIX, 'STEP 8: show UI of the successfully sent transaction')
    swapConfirmManager.transactionSent(orderId)
  } catch (error) {
    logTradeFlow(LOG_PREFIX, 'STEP 9: error', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
