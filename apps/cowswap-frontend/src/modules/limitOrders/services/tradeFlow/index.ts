import { reportPermitWithDefaultSigner } from '@cowprotocol/common-utils'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { Command, UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { emitPostedOrderEvent } from 'modules/orders'
import { handlePermit } from 'modules/permit'
import { appDataContainsPermitSigner } from 'modules/permit/utils/appDataContainsPermitSigner'
import { presignOrderStep } from 'modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { TradeFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  beforePermit: () => Promise<void>,
  beforeTrade: Command
): Promise<string> {
  const {
    postOrderParams,
    rateImpact,
    permitInfo,
    provider,
    chainId,
    allowsOffchainSigning,
    settlementContract,
    dispatch,
    generatePermitHook,
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

  const validTo = calculateLimitOrdersDeadline(settingsState, params.quoteState)

  try {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(permitInfo)) await beforePermit()

    postOrderParams.appData = await handlePermit({
      permitInfo,
      inputToken: sellToken,
      account,
      appData,
      generatePermitHook,
    })

    if (appDataContainsPermitSigner(postOrderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(postOrderParams)
    }

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 3: send transaction')
    tradeFlowAnalytics.trade(swapFlowAnalyticsContext)

    beforeTrade()

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 4: sign and post order')
    const { id: orderId, order } = await signAndPostOrder({
      ...postOrderParams,
      signer: provider.getSigner(),
      validTo,
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
      dispatch
    )

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 6: presign order (optional)')
    const presignTx = await (allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, settlementContract))

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 7: unhide SC order (optional)')
    if (presignTx) {
      partialOrderUpdate(
        {
          chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: isSafeWallet ? presignTx.hash : undefined,
            isHidden: false,
          },
          isSafeWallet,
        },
        dispatch
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
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return orderId
  } catch (error: any) {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 9: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
