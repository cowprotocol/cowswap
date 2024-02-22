import { currencyAmountToTokenAmount, reportAppDataWithHooks } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { updateHooksOnAppData } from 'modules/appData'
import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, SafeBundleFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from 'modules/operations/bundle/buildPresignTx'
import { buildZeroApproveTx } from 'modules/operations/bundle/buildZeroApproveTx'
import { appDataContainsHooks } from 'modules/permit/utils/appDataContainsHooks'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { SwapFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { shouldZeroApprove as shouldZeroApproveFn } from 'modules/zeroApproval'

import { UiOrderType } from 'utils/orderUtils/getUiOrderType'

import { emitPostedOrderEvent } from '../../../../legacy/state/orders/middleware/emitPostedOrderEvent'

const LOG_PREFIX = 'LIMIT ORDER SAFE BUNDLE FLOW'
export async function safeBundleFlow(
  params: SafeBundleFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  beforeTrade?: Command
): Promise<string> {
  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')
  const isTooLowRate = params.rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact.priceImpact))) {
    throw new PriceImpactDeclineError()
  }

  const {
    account,
    recipientAddressOrName,
    sellToken,
    buyToken,
    inputAmount,
    outputAmount,
    class: orderClass,
    isSafeWallet,
  } = params.postOrderParams

  // TODO: remove once we figure out what's adding this to appData in the first place
  if (appDataContainsHooks(params.postOrderParams.appData.fullAppData)) {
    reportAppDataWithHooks(params.postOrderParams)
    // wipe out the hooks
    params.postOrderParams.appData = await updateHooksOnAppData(params.postOrderParams.appData, undefined)
  }

  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient: recipientAddressOrName,
    recipientAddress: recipientAddressOrName,
    marketLabel: [sellToken.symbol, buyToken.symbol].join(','),
    orderClass,
  }

  logTradeFlow(LOG_PREFIX, 'STEP 2: send transaction')
  tradeFlowAnalytics.approveAndPresign(swapFlowAnalyticsContext)
  beforeTrade?.()

  const { chainId, postOrderParams, provider, erc20Contract, spender, dispatch, settlementContract, safeAppsSdk } =
    params

  const validTo = calculateLimitOrdersDeadline(settingsState)

  try {
    // For now, bundling ALWAYS includes 2 steps: approve and presign.
    // In the feature users will be able to sort/add steps as they see fit
    logTradeFlow(LOG_PREFIX, 'STEP 2: build approval tx')
    const approveTx = await buildApproveTx({
      erc20Contract,
      spender,
      amountToApprove: inputAmount,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 3: post order')
    const { id: orderId, order } = await signAndPostOrder({
      ...postOrderParams,
      signer: provider.getSigner(),
      validTo,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 4: add order, but hidden')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          isHidden: true,
        },
        isSafeWallet,
      },
      dispatch
    )

    logTradeFlow(LOG_PREFIX, 'STEP 5: build presign tx')
    const presignTx = await buildPresignTx({ settlementContract, orderId })

    logTradeFlow(LOG_PREFIX, 'STEP 6: send safe tx')
    const safeTransactionData: MetaTransactionData[] = [
      { to: approveTx.to!, data: approveTx.data!, value: '0', operation: 0 },
      { to: presignTx.to!, data: presignTx.data!, value: '0', operation: 0 },
    ]

    const shouldZeroApprove = await shouldZeroApproveFn({
      tokenContract: erc20Contract,
      spender,
      amountToApprove: inputAmount,
      isBundle: true,
    })

    if (shouldZeroApprove) {
      const zeroApproveTx = await buildZeroApproveTx({
        erc20Contract,
        spender,
        currency: inputAmount.currency,
      })
      safeTransactionData.unshift({
        to: zeroApproveTx.to!,
        data: zeroApproveTx.data!,
        value: '0',
        operation: 0,
      })
    }

    const safeTx = await safeAppsSdk.txs.send({ txs: safeTransactionData })
    const safeTxHash = safeTx.safeTxHash

    emitPostedOrderEvent({
      chainId,
      id: safeTxHash,
      kind: OrderKind.SELL,
      receiver: recipientAddressOrName,
      inputAmount: currencyAmountToTokenAmount(inputAmount),
      outputAmount: currencyAmountToTokenAmount(outputAmount),
      owner: account,
      uiOrderType: UiOrderType.LIMIT,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 7: add safe tx hash and unhide order')
    partialOrderUpdate(
      {
        chainId: chainId,
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

    return orderId
  } catch (error: any) {
    logTradeFlow(LOG_PREFIX, 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
