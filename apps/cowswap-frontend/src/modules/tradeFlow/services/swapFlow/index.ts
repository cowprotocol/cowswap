import { getAddress, reportPermitWithDefaultSigner } from '@cowprotocol/common-utils'
import { SigningScheme } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { getOrderSubmitSummary, mapUnsignedOrderToOrder, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { emitPostedOrderEvent } from 'modules/orders'
import { callDataContainsPermitSigner, handlePermit } from 'modules/permit'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'
import { NO_QUOTE_IN_ORDER_ERROR } from 'modules/tradeQuote'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { TradeFlowContext } from '../../types/TradeFlowContext'

export async function swapFlow(
  input: TradeFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  analytics: TradeFlowAnalytics,
): Promise<void | boolean> {
  const {
    tradeConfirmActions,
    callbacks: { getCachedPermit },
    tradeQuote,
  } = input

  const {
    context: { inputAmount, outputAmount },
    typedHooks,
  } = input
  const tradeAmounts = { inputAmount, outputAmount }

  if (!tradeQuote.quote) {
    throw new Error(NO_QUOTE_IN_ORDER_ERROR)
  }

  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  const { orderParams, context, permitInfo, generatePermitHook, swapFlowAnalyticsContext, callbacks } = input
  const { chainId } = context
  const inputCurrency = inputAmount.currency
  const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(permitInfo) && !cachedPermit) {
      tradeConfirmActions.requestPermitSignature(tradeAmounts)
    }

    const { appData, account, isSafeWallet, recipientAddressOrName, inputAmount, outputAmount, kind } = orderParams

    orderParams.appData = await handlePermit({
      appData,
      typedHooks,
      account,
      inputToken: inputCurrency,
      permitInfo,
      generatePermitHook,
    })

    if (callDataContainsPermitSigner(orderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(orderParams)
    }

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    analytics.trade(swapFlowAnalyticsContext)

    tradeConfirmActions.onSign(tradeAmounts)

    logTradeFlow('SWAP FLOW', 'STEP 4: sign and post order')
    const {
      orderId,
      signature,
      signingScheme,
      orderToSign: unsignedOrder,
    } = await wrapErrorInOperatorError(() =>
      tradeQuote
        .quote!.postSwapOrderFromQuote({
          appData: orderParams.appData.doc,
          additionalParams: {
            signingScheme: orderParams.allowsOffchainSigning ? SigningScheme.EIP712 : SigningScheme.PRESIGN,
          },
          quoteRequest: {
            validTo: orderParams.validTo,
            receiver: orderParams.recipient,
          },
        })
        .finally(() => {
          callbacks.closeModals()
        }),
    )

    let presignTxHash: string | null = null

    if (!orderParams.allowsOffchainSigning) {
      logTradeFlow('SWAP FLOW', 'STEP 5: presign order (optional)')
      const presignTx = await tradingSdk.getPreSignTransaction({ orderId, account })

      presignTxHash = (await orderParams.signer.sendTransaction(presignTx)).hash
    }

    const order = mapUnsignedOrderToOrder({
      unsignedOrder,
      additionalParams: {
        ...orderParams,
        orderId,
        summary: getOrderSubmitSummary(orderParams),
        signingScheme,
        signature,
      },
    })

    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !input.flags.allowsOffchainSigning,
        },
        isSafeWallet,
      },
      callbacks.dispatch,
    )

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
    })

    logTradeFlow('SWAP FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTxHash) {
      partialOrderUpdate(
        {
          chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: isSafeWallet ? presignTxHash : undefined,
            isHidden: false,
          },
          isSafeWallet,
        },
        callbacks.dispatch,
      )
    }

    logTradeFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(swapFlowAnalyticsContext)

    return true
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
