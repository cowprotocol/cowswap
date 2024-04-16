import { reportAppDataWithHooks, reportPlaceOrderWithExpiredQuote } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { updateHooksOnAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { appDataContainsHooks } from 'modules/permit/utils/appDataContainsHooks'
import { signEthFlowOrderStep } from 'modules/swap/services/ethFlow/steps/signEthFlowOrderStep'
import { EthFlowContext } from 'modules/swap/services/types'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { isQuoteExpired } from 'modules/tradeQuote'

import { calculateUniqueOrderId } from './steps/calculateUniqueOrderId'

export async function ethFlow(
  ethFlowContext: EthFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
): Promise<void | false> {
  const {
    tradeConfirmActions,
    swapFlowAnalyticsContext,
    context,
    contract,
    callbacks,
    appDataInfo,
    dispatch,
    orderParams: orderParamsOriginal,
    checkEthFlowOrderExists,
    addInFlightOrderId,
    quote,
  } = ethFlowContext
  const {
    chainId,
    trade: { inputAmount, outputAmount, fee },
  } = context
  const tradeAmounts = { inputAmount, outputAmount }
  const { account, recipientAddressOrName, kind } = orderParamsOriginal

  logTradeFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  // TODO: remove once we figure out what's adding this to appData in the first place
  if (appDataContainsHooks(orderParamsOriginal.appData.fullAppData)) {
    reportAppDataWithHooks(orderParamsOriginal)
    // wipe out the hooks
    orderParamsOriginal.appData = await updateHooksOnAppData(orderParamsOriginal.appData, undefined)
  }

  logTradeFlow('ETH FLOW', 'STEP 2: send transaction')
  // TODO: check if we need own eth flow analytics or more generic
  tradeFlowAnalytics.trade(swapFlowAnalyticsContext)
  tradeConfirmActions.onSign(tradeAmounts)

  logTradeFlow('ETH FLOW', 'STEP 3: Get Unique Order Id (prevent collisions)')
  const { orderId, orderParams } = await calculateUniqueOrderId(orderParamsOriginal, contract, checkEthFlowOrderExists)

  try {
    // Do not proceed if fee is expired
    if (
      isQuoteExpired({
        expirationDate: fee.expirationDate,
        deadlineParams: {
          validFor: quote?.validFor,
          quoteValidTo: quote?.quoteValidTo,
          localQuoteTimestamp: quote?.localQuoteTimestamp,
        },
      })
    ) {
      reportPlaceOrderWithExpiredQuote({ ...orderParamsOriginal, fee })
      throw new Error('Quote expired. Please refresh.')
    }

    logTradeFlow('ETH FLOW', 'STEP 4: sign order')
    const { order, txReceipt } = await signEthFlowOrderStep(orderId, orderParams, contract, addInFlightOrderId).finally(
      () => {
        callbacks.closeModals()
      }
    )

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      orderCreationHash: txReceipt.hash,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
      isEthFlow: true,
    })

    logTradeFlow('ETH FLOW', 'STEP 5: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: context.chainId,
        order,
        isSafeWallet: orderParams.isSafeWallet,
      },
      dispatch
    )
    // TODO: maybe move this into addPendingOrderStep?
    ethFlowContext.addTransaction({ hash: txReceipt.hash, ethFlow: { orderId: order.id, subType: 'creation' } })

    logTradeFlow('ETH FLOW', 'STEP 6: add app data to upload queue')
    callbacks.uploadAppData({ chainId: context.chainId, orderId, appData: appDataInfo })

    logTradeFlow('ETH FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)
  } catch (error: any) {
    logTradeFlow('ETH FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
