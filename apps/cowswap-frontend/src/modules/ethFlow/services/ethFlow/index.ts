import { getEthFlowContractAddresses } from '@cowprotocol/common-const'
import { reportPlaceOrderWithExpiredQuote } from '@cowprotocol/common-utils'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { removePermitHookFromAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'
import { TradeFlowContext } from 'modules/tradeFlow'
import { isQuoteExpired } from 'modules/tradeQuote'

import { ethFlowEnv } from 'common/hooks/useContract'
import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { calculateUniqueOrderId } from './steps/calculateUniqueOrderId'
import { signEthFlowOrderStep } from './steps/signEthFlowOrderStep'

import { EthFlowContext } from '../../types'

export interface EthFlowParams {
  tradeContext: TradeFlowContext
  ethFlowContext: EthFlowContext
  priceImpactParams: PriceImpact
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
  analytics: TradeFlowAnalytics
}

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
    orderParams: orderParamsOriginal,
    typedHooks,
  } = tradeContext
  const { contract, appData, uploadAppData, addTransaction, checkEthFlowOrderExists, addInFlightOrderId, quote } =
    ethFlowContext

  const { chainId, inputAmount, outputAmount } = context
  const tradeAmounts = { inputAmount, outputAmount }
  const { account, recipientAddressOrName, kind } = orderParamsOriginal

  logTradeFlow('ETH FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  orderParamsOriginal.appData = await removePermitHookFromAppData(orderParamsOriginal.appData, typedHooks)

  logTradeFlow('ETH FLOW', 'STEP 2: send transaction')
  analytics.trade(swapFlowAnalyticsContext)
  tradeConfirmActions.onSign(tradeAmounts)

  logTradeFlow('ETH FLOW', 'STEP 3: Get Unique Order Id (prevent collisions)')
  const { orderId, orderParams } = await calculateUniqueOrderId(orderParamsOriginal, contract, checkEthFlowOrderExists)

  try {
    // Do not proceed if fee is expired
    if (quote && isQuoteExpired(quote)) {
      reportPlaceOrderWithExpiredQuote({ ...orderParamsOriginal, fee: quote.response?.quote.feeAmount })
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

    logTradeFlow('ETH FLOW', 'STEP 4: sign order')
    const { order, txReceipt } = await signEthFlowOrderStep(
      orderId,
      orderParams,
      contract,
      addInFlightOrderId,
      tradeContext,
    ).finally(() => {
      callbacks.closeModals()
    })

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
      callbacks.dispatch,
    )
    // TODO: maybe move this into addPendingOrderStep?
    addTransaction({ hash: txReceipt.hash, ethFlow: { orderId: order.id, subType: 'creation' } })

    logTradeFlow('ETH FLOW', 'STEP 6: add app data to upload queue')
    uploadAppData({ chainId: context.chainId, orderId, appData })

    logTradeFlow('ETH FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(swapFlowAnalyticsContext)

    return true
  } catch (error: any) {
    logTradeFlow('ETH FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
