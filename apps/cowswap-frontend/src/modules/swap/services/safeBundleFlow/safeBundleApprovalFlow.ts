import { reportAppDataWithHooks } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { updateHooksOnAppData } from 'modules/appData'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from 'modules/operations/bundle/buildPresignTx'
import { buildZeroApproveTx } from 'modules/operations/bundle/buildZeroApproveTx'
import { emitPostedOrderEvent } from 'modules/orders'
import { appDataContainsHooks } from 'modules/permit/utils/appDataContainsHooks'
import { SafeBundleApprovalFlowContext } from 'modules/swap/services/types'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { shouldZeroApprove as shouldZeroApproveFn } from 'modules/zeroApproval'

const LOG_PREFIX = 'SAFE APPROVAL BUNDLE FLOW'

export async function safeBundleApprovalFlow(
  input: SafeBundleApprovalFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
): Promise<void | false> {
  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')

  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  const {
    erc20Contract,
    spender,
    context,
    callbacks,
    dispatch,
    orderParams,
    settlementContract,
    safeAppsSdk,
    swapFlowAnalyticsContext,
    tradeConfirmActions,
  } = input

  const { chainId } = context
  const { appData, account, isSafeWallet, recipientAddressOrName, inputAmount, outputAmount, kind } = orderParams
  const tradeAmounts = { inputAmount, outputAmount }

  tradeFlowAnalytics.approveAndPresign(swapFlowAnalyticsContext)
  tradeConfirmActions.onSign(tradeAmounts)

  try {
    // For now, bundling ALWAYS includes 2 steps: approve and presign.
    // In the feature users will be able to sort/add steps as they see fit
    logTradeFlow(LOG_PREFIX, 'STEP 2: build approval tx')
    const approveTx = await buildApproveTx({
      erc20Contract,
      spender,
      amountToApprove: context.trade.inputAmount,
    })

    // TODO: remove once we figure out what's adding this to appData in the first place
    // make sure no pre-approval hooks are included, just as a safety measure
    if (appDataContainsHooks(appData.fullAppData)) {
      reportAppDataWithHooks(orderParams)
      // wipe out the hooks
      orderParams.appData = await updateHooksOnAppData(orderParams.appData, undefined)
    }

    logTradeFlow(LOG_PREFIX, 'STEP 3: post order')
    const { id: orderId, order } = await signAndPostOrder(orderParams).finally(() => {
      callbacks.closeModals()
    })

    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order: {
          ...order,
          isHidden: true,
        },
        isSafeWallet,
      },
      dispatch
    )

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

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      orderCreationHash: safeTx.safeTxHash,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 6: add safe tx hash and unhide order')
    partialOrderUpdate(
      {
        chainId: context.chainId,
        order: {
          id: order.id,
          presignGnosisSafeTxHash: safeTx.safeTxHash,
          isHidden: false,
        },
        isSafeWallet,
      },
      dispatch
    )
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    logTradeFlow(LOG_PREFIX, 'STEP 7: show UI of the successfully sent transaction')
    tradeConfirmActions.onSuccess(orderId)
  } catch (error) {
    logTradeFlow(LOG_PREFIX, 'STEP 8: error', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
