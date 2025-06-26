import { SigningScheme } from '@cowprotocol/cow-sdk'
import { Command, UiOrderType } from '@cowprotocol/types'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { Percent } from '@uniswap/sdk-core'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { getOrderSubmitSummary, mapUnsignedOrderToOrder, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { removePermitHookFromAppData } from 'modules/appData'
import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, SafeBundleFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildZeroApproveTx } from 'modules/operations/bundle/buildZeroApproveTx'
import { emitPostedOrderEvent } from 'modules/orders'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics, TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import { shouldZeroApprove as shouldZeroApproveFn } from 'modules/zeroApproval'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

const LOG_PREFIX = 'LIMIT ORDER SAFE BUNDLE FLOW'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export async function safeBundleFlow(
  params: SafeBundleFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  analytics: TradeFlowAnalytics,
  beforeTrade?: Command,
): Promise<string> {
  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')
  const isTooLowRate = params.rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact.priceImpact))) {
    throw new PriceImpactDeclineError()
  }

  const { account, recipientAddressOrName, sellToken, buyToken, inputAmount, outputAmount, isSafeWallet } =
    params.postOrderParams

  params.postOrderParams.appData = await removePermitHookFromAppData(params.postOrderParams.appData, params.typedHooks)

  const swapFlowAnalyticsContext: TradeFlowAnalyticsContext = {
    account,
    recipient: recipientAddressOrName,
    recipientAddress: recipientAddressOrName,
    marketLabel: [sellToken.symbol, buyToken.symbol].join(','),
    orderType: UiOrderType.LIMIT,
  }

  logTradeFlow(LOG_PREFIX, 'STEP 2: send transaction')
  analytics.approveAndPresign(swapFlowAnalyticsContext)
  beforeTrade?.()

  const { chainId, postOrderParams, erc20Contract, spender, dispatch, sendBatchTransactions } = params

  const validTo = calculateLimitOrdersDeadline(settingsState, params.quoteState)

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
    const {
      orderId,
      signature,
      signingScheme,
      orderToSign: unsignedOrder,
    } = await wrapErrorInOperatorError(() =>
      tradingSdk.postLimitOrder(
        {
          sellAmount: postOrderParams.inputAmount.quotient.toString(),
          buyAmount: postOrderParams.outputAmount.quotient.toString(),
          sellToken: postOrderParams.sellToken.address,
          buyToken: postOrderParams.buyToken.address,
          sellTokenDecimals: postOrderParams.sellToken.decimals,
          buyTokenDecimals: postOrderParams.buyToken.decimals,
          kind: postOrderParams.kind,
          partiallyFillable: postOrderParams.partiallyFillable,
          receiver: postOrderParams.recipient,
          validTo,
          quoteId: postOrderParams.quoteId,
        },
        {
          appData: postOrderParams.appData.doc,
          additionalParams: {
            signingScheme: SigningScheme.PRESIGN,
          },
        },
      ),
    )

    const order = mapUnsignedOrderToOrder({
      unsignedOrder,
      additionalParams: {
        ...postOrderParams,
        orderId,
        summary: getOrderSubmitSummary(postOrderParams),
        signingScheme,
        signature,
      },
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
      dispatch,
    )

    logTradeFlow(LOG_PREFIX, 'STEP 5: build presign tx')
    const presignTx = await tradingSdk.getPreSignTransaction({ orderId, account })

    logTradeFlow(LOG_PREFIX, 'STEP 6: send safe tx')
    const safeTransactionData: MetaTransactionData[] = [
      { to: approveTx.to!, data: approveTx.data!, value: '0', operation: 0 },
      { to: presignTx.to, data: presignTx.data, value: '0', operation: 0 },
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

    const safeTxHash = await sendBatchTransactions(safeTransactionData)

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      orderCreationHash: safeTxHash,
      kind: postOrderParams.kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.LIMIT,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 7: add safe tx hash and unhide order')
    partialOrderUpdate(
      {
        chainId: chainId,
        order: {
          id: order.id,
          presignGnosisSafeTxHash: safeTxHash,
          isHidden: false,
        },
        isSafeWallet,
      },
      dispatch,
    )
    analytics.sign(swapFlowAnalyticsContext)

    return orderId
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logTradeFlow(LOG_PREFIX, 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
