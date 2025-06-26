import { reportPermitWithDefaultSigner } from '@cowprotocol/common-utils'
import { SigningScheme } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { Command, UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { getOrderSubmitSummary, mapUnsignedOrderToOrder, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { emitPostedOrderEvent } from 'modules/orders'
import { callDataContainsPermitSigner, handlePermit } from 'modules/permit'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import type { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  analytics: TradeFlowAnalytics,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  beforePermit: () => Promise<void>,
  beforeTrade: Command,
): Promise<string> {
  const {
    postOrderParams,
    typedHooks,
    rateImpact,
    permitInfo,
    chainId,
    allowsOffchainSigning,
    dispatch,
    generatePermitHook,
    quoteState,
    signer,
  } = params
  const { account, recipientAddressOrName, sellToken, buyToken, appData, isSafeWallet, inputAmount, outputAmount } =
    postOrderParams
  const marketLabel = [sellToken.symbol, buyToken.symbol].join(',')

  const swapFlowAnalyticsContext: TradeFlowAnalyticsContext = {
    account,
    recipient: recipientAddressOrName,
    recipientAddress: recipientAddressOrName,
    marketLabel,
    orderType: UiOrderType.LIMIT,
  }

  logTradeFlow('LIMIT ORDER FLOW', 'STEP 1: confirm price impact')
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact.priceImpact))) {
    throw new PriceImpactDeclineError()
  }

  const validTo = calculateLimitOrdersDeadline(settingsState, quoteState)

  try {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(permitInfo)) await beforePermit()

    postOrderParams.appData = await handlePermit({
      permitInfo,
      inputToken: sellToken,
      account,
      appData,
      typedHooks,
      generatePermitHook,
    })

    if (callDataContainsPermitSigner(postOrderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(postOrderParams)
    }

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 3: send transaction')
    analytics.trade(swapFlowAnalyticsContext)

    beforeTrade()

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 4: sign and post order')

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
            signingScheme: postOrderParams.allowsOffchainSigning ? SigningScheme.EIP712 : SigningScheme.PRESIGN,
          },
        },
      ),
    )

    let presignTxHash: string | null = null

    if (!postOrderParams.allowsOffchainSigning) {
      const presignTx = await tradingSdk.getPreSignTransaction({ orderId, account })

      presignTxHash = (await signer.sendTransaction(presignTx)).hash
    }

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

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 5: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !allowsOffchainSigning,
        },
        isSafeWallet,
      },
      dispatch,
    )

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 6: unhide SC order (optional)')
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
        dispatch,
      )
    }

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      kind: postOrderParams.kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.LIMIT,
    })

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 8: Sign order')
    analytics.sign(swapFlowAnalyticsContext)

    return orderId
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 9: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
