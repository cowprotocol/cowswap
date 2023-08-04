import { Erc20 } from '@cowprotocol/abis'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from 'modules/operations/bundle/buildPresignTx'
import { buildWrapTx } from 'modules/operations/bundle/buildWrapTx'
import { SafeBundleEthFlowContext } from 'modules/swap/services/types'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

const LOG_PREFIX = 'SAFE BUNDLE ETH FLOW'

export async function safeBundleEthFlow(
  input: SafeBundleEthFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
): Promise<void> {
  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')

  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return
  }

  const {
    wrappedNativeContract,
    needsApproval,
    spender,
    context,
    callbacks,
    swapConfirmManager,
    dispatch,
    orderParams,
    settlementContract,
    safeAppsSdk,
    swapFlowAnalyticsContext,
  } = input

  tradeFlowAnalytics.wrapApproveAndPresign(swapFlowAnalyticsContext)
  const nativeAmountInWei = context.inputAmountWithSlippage.quotient.toString()

  try {
    const txs: MetaTransactionData[] = []

    logTradeFlow(LOG_PREFIX, 'STEP 2: wrap native token')
    const wrapTx = await buildWrapTx({ wrappedNativeContract, weiAmount: nativeAmountInWei })

    txs.push({
      to: wrapTx.to!,
      data: wrapTx.data!,
      value: wrapTx.value!.toString(),
      operation: 0,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 3: [optional] build approval tx')

    if (needsApproval) {
      const approveTx = await buildApproveTx({
        erc20Contract: wrappedNativeContract as unknown as Erc20,
        spender,
        amountToApprove: context.inputAmountWithSlippage,
      })

      txs.push({
        to: approveTx.to!,
        data: approveTx.data!,
        value: '0',
        operation: 0,
      })
    }

    logTradeFlow(LOG_PREFIX, 'STEP 4: post order')
    const { id: orderId, order } = await signAndPostOrder(orderParams).finally(() => {
      callbacks.closeModals()
    })

    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order: {
          ...order,
          // Initially as hidden, until we get a confirmation from the wallet it succeeded
          isHidden: true,
        },
      },
      dispatch
    )

    logTradeFlow(LOG_PREFIX, 'STEP 5: build presign tx')
    const presignTx = await buildPresignTx({ settlementContract, orderId })

    txs.push({
      to: presignTx.to!,
      data: presignTx.data!,
      value: '0',
      operation: 0,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 6: send safe tx')

    const safeTx = await safeAppsSdk.txs.send({ txs })

    logTradeFlow(LOG_PREFIX, 'STEP 7: add safe tx hash and unhide order')
    partialOrderUpdate(
      {
        chainId: context.chainId,
        order: {
          id: order.id,
          // Add Safe tx hash
          presignGnosisSafeTxHash: safeTx.safeTxHash,
          // Unhide the order
          isHidden: false,
        },
      },
      dispatch
    )
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    logTradeFlow(LOG_PREFIX, 'STEP 8: show UI of the successfully sent transaction')
    swapConfirmManager.transactionSent(orderId)
  } catch (error) {
    logTradeFlow(LOG_PREFIX, 'STEP 9: error', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
