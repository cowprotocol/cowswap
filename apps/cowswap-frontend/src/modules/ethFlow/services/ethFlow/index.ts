import { getEthFlowContractAddresses } from '@cowprotocol/common-const'
import { reportPlaceOrderWithExpiredQuote } from '@cowprotocol/common-utils'
import { OrderClass, SigningScheme } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { getOrderSubmitSummary, mapUnsignedOrderToOrder, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { removePermitHookFromAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'
import { TradeFlowContext } from 'modules/tradeFlow'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ethFlowEnv } from 'common/hooks/useContract'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { EthFlowContext } from '../../types'

export interface EthFlowParams {
  tradeContext: TradeFlowContext
  ethFlowContext: EthFlowContext
  priceImpactParams: PriceImpact
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
  analytics: TradeFlowAnalytics
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export async function ethFlow({
  tradeContext,
  ethFlowContext,
  priceImpactParams,
  confirmPriceImpactWithoutFee,
  analytics,
}: EthFlowParams): Promise<void | boolean> {
  const {
    tradeConfirmActions,
    swapFlowAnalyticsContext,
    context,
    callbacks,
    orderParams,
    typedHooks,
    tradeQuote,
    tradeQuoteState,
  } = tradeContext
  const { contract, appData, uploadAppData, addTransaction, checkEthFlowOrderExists, addInFlightOrderId } =
    ethFlowContext

  const { chainId, inputAmount, outputAmount } = context
  const tradeAmounts = { inputAmount, outputAmount }
  const { account, recipientAddressOrName, kind } = orderParams

  logTradeFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  orderParams.appData = await removePermitHookFromAppData(orderParams.appData, typedHooks)

  logTradeFlow('ETH FLOW', 'STEP 2: send transaction')
  analytics.trade(swapFlowAnalyticsContext)
  tradeConfirmActions.onSign(tradeAmounts)

  try {
    // Do not proceed if fee is expired
    if (isQuoteExpired(tradeQuoteState)) {
      reportPlaceOrderWithExpiredQuote({
        ...orderParams,
        fee: tradeQuote.quoteResults.quoteResponse.quote.feeAmount,
      })
      throw new Error('Quote expired. Please refresh.')
    }

    // Last check before signing the order of the actual eth flow contract address (sending ETH to the wrong contract could lead to loss of funds)
    const actualContractAddress = contract.address.toLowerCase()
    const expectedContractAddress = getEthFlowContractAddresses(ethFlowEnv).toLowerCase()
    if (actualContractAddress !== expectedContractAddress) {
      throw new Error(
        `EthFlow contract (${actualContractAddress}) address don't match the expected address for chain ${chainId} (${expectedContractAddress}). Please refresh the page and try again.`,
      )
    }

    logTradeFlow('ETH FLOW', 'STEP 3: sign order')

    const {
      orderId,
      txHash,
      signature,
      signingScheme,
      orderToSign: unsignedOrder,
    } = await wrapErrorInOperatorError(() =>
      tradeQuote
        .postSwapOrderFromQuote({
          appData: orderParams.appData.doc,
          additionalParams: {
            checkEthFlowOrderExists,
          },
          quoteRequest: {
            signingScheme: SigningScheme.EIP1271,
            validTo: orderParams.validTo,
            receiver: orderParams.recipient,
          },
        })
        .finally(() => {
          callbacks.closeModals()
        }),
    )

    const quoteId = tradeQuote.quoteResults.quoteResponse.id

    const order = mapUnsignedOrderToOrder({
      unsignedOrder,
      additionalParams: {
        ...orderParams,
        orderId,
        summary: getOrderSubmitSummary(orderParams),
        signingScheme,
        signature,
        // For ETH-flow we always set order class to 'market' since we don't support ETH-flow in Limit orders
        class: OrderClass.MARKET,
        quoteId,
        orderCreationHash: txHash,
        isOnChain: true, // always on-chain
      },
    })

    addInFlightOrderId(orderId)

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      orderCreationHash: txHash,
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
      callbacks.dispatch,
    )
    // TODO: maybe move this into addPendingOrderStep?
    addTransaction({ hash: txHash!, ethFlow: { orderId: order.id, subType: 'creation' } })

    logTradeFlow('ETH FLOW', 'STEP 6: add app data to upload queue')
    uploadAppData({ chainId: context.chainId, orderId, appData })

    logTradeFlow('ETH FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(swapFlowAnalyticsContext)

    return true
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logTradeFlow('ETH FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
