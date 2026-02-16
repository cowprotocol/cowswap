import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Erc20 } from '@cowprotocol/cowswap-abis'
import { UiOrderType } from '@cowprotocol/types'
import type { MetaTransactionData } from '@safe-global/types-kit'
import { Percent } from '@uniswap/sdk-core'

import { tradingSdk } from 'tradingSdk/tradingSdk'
import { encodeFunctionData } from 'viem'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { mapUnsignedOrderToOrder, type PostOrderParams, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { removePermitHookFromAppData } from 'modules/appData'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { emitPostedOrderEvent } from 'modules/orders'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { SafeBundleFlowContext, TradeFlowContext } from '../../types/TradeFlowContext'

const LOG_PREFIX = 'SAFE BUNDLE ETH FLOW'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export async function safeBundleEthFlow(
  tradeContext: TradeFlowContext,
  safeBundleContext: SafeBundleFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  analytics: TradeFlowAnalytics,
): Promise<void | boolean> {
  const {
    context,
    callbacks,
    swapFlowAnalyticsContext,
    tradeConfirmActions,
    typedHooks,
    tradeQuote,
    bridgeQuoteAmounts,
  } = tradeContext

  logTradeFlow(LOG_PREFIX, 'STEP 1: confirm price impact')

  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  const { spender, sendBatchTransactions, needsApproval, wrappedNativeContract, amountToApprove } = safeBundleContext

  const { chainId, inputAmount, outputAmount } = context

  const orderParams: PostOrderParams = {
    ...tradeContext.orderParams,
    sellToken: WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId],
  }

  const { account, recipientAddressOrName, kind } = orderParams

  analytics.wrapApproveAndPresign(swapFlowAnalyticsContext)
  const nativeAmountInWei = inputAmount.quotient.toString()
  const tradeAmounts = { inputAmount, outputAmount }

  tradeConfirmActions.onSign(tradeAmounts)
  try {
    const txs: MetaTransactionData[] = []

    logTradeFlow(LOG_PREFIX, 'STEP 2: wrap native token')

    txs.push({
      to: wrappedNativeContract.address,
      data: encodeFunctionData({ abi: wrappedNativeContract.abi, functionName: 'deposit' }),
      value: nativeAmountInWei,
      operation: 0,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 3: [optional] build approval tx')

    if (needsApproval) {
      const approveTx = await buildApproveTx({
        erc20Contract: wrappedNativeContract as unknown as Erc20,
        spender,
        amountToApprove: BigInt(amountToApprove.quotient.toString()),
      })

      txs.push({
        to: approveTx.to!,
        data: approveTx.data!,
        value: '0',
        operation: 0,
      })
    }

    orderParams.appData = await removePermitHookFromAppData(orderParams.appData, typedHooks)

    logTradeFlow(LOG_PREFIX, 'STEP 4: post order')

    const {
      orderId,
      signature,
      signingScheme,
      orderToSign: unsignedOrder,
    } = await wrapErrorInOperatorError(() =>
      tradeQuote
        .postSwapOrderFromQuote({
          appData: orderParams.appData.doc,
          quoteRequest: {
            signingScheme: SigningScheme.PRESIGN,
            validTo: orderParams.validTo,
            receiver: orderParams.recipient,
            // Override the sellToken to be the wrapped native token
            sellToken: WRAPPED_NATIVE_CURRENCIES[chainId as SupportedChainId].address,
          },
        })
        .finally(() => {
          callbacks.closeModals()
        }),
    )

    const order = mapUnsignedOrderToOrder({
      unsignedOrder,
      additionalParams: {
        ...orderParams,
        orderId,
        signature,
        signingScheme,
      },
    })

    if (bridgeQuoteAmounts) {
      tradeContext.callbacks.addBridgeOrder({
        orderUid: orderId,
        quoteAmounts: bridgeQuoteAmounts,
        creationTimestamp: Date.now(),
        recipient: orderParams.recipient,
      })
    }

    const { isSafeWallet } = orderParams
    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order: {
          ...order,
          // Initially as hidden, until we get a confirmation from the wallet it succeeded
          isHidden: true,
        },
        isSafeWallet,
      },
      callbacks.dispatch,
    )

    logTradeFlow(LOG_PREFIX, 'STEP 5: build presign tx')
    const presignTx = await tradingSdk.getPreSignTransaction({ orderUid: orderId })

    txs.push({
      to: presignTx.to!,
      data: presignTx.data!,
      value: '0',
      operation: 0,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 6: send safe tx')

    const safeTxHash = await sendBatchTransactions(txs)

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount: bridgeQuoteAmounts?.bridgeMinReceiveAmount || outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
      isEthFlow: true,
    })

    logTradeFlow(LOG_PREFIX, 'STEP 7: add safe tx hash and unhide order')
    partialOrderUpdate(
      {
        chainId: context.chainId,
        order: {
          id: order.id,
          // Add Safe tx hash
          presignGnosisSafeTxHash: safeTxHash,
          // Unhide the order
          isHidden: false,
        },
        isSafeWallet,
      },
      callbacks.dispatch,
    )
    analytics.sign(swapFlowAnalyticsContext)

    logTradeFlow(LOG_PREFIX, 'STEP 8: show UI of the successfully sent transaction')
    tradeConfirmActions.onSuccess(orderId)

    return true
  } catch (error) {
    logTradeFlow(LOG_PREFIX, 'STEP 9: error', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
