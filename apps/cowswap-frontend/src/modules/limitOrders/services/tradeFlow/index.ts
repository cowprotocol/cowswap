import { OrderClass } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { buildAppDataHooks, updateHooksOnAppData } from 'modules/appData'
import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { PriceImpactDeclineError, TradeFlowContext } from 'modules/limitOrders/services/types'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { generatePermitHook } from 'modules/permit'
import { presignOrderStep } from 'modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { SwapFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  beforeTrade?: () => void
): Promise<string> {
  const {
    postOrderParams,
    rateImpact,
    permitInfo,
    provider,
    chainId,
    hasEnoughAllowance,
    allowsOffchainSigning,
    settlementContract,
    dispatch,
    isGnosisSafeWallet,
  } = params
  const { account, recipientAddressOrName, sellToken, buyToken, appData } = postOrderParams
  const marketLabel = [sellToken.symbol, buyToken.symbol].join(',')
  const swapFlowAnalyticsContext: SwapFlowAnalyticsContext = {
    account,
    recipient: recipientAddressOrName,
    recipientAddress: recipientAddressOrName,
    marketLabel,
    orderClass: OrderClass.LIMIT,
  }

  logTradeFlow('LIMIT ORDER FLOW', 'STEP 1: confirm price impact')
  const isTooLowRate = rateImpact < LOW_RATE_THRESHOLD_PERCENT

  if (!isTooLowRate && priceImpact.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpact.priceImpact))) {
    throw new PriceImpactDeclineError()
  }

  if (permitInfo && !hasEnoughAllowance) {
    // If token is permittable and there's not enough allowance, get th permit hook

    // TODO: maybe we need a modal to inform the user what they need to sign?
    const permitData = await generatePermitHook({
      inputToken: sellToken,
      provider,
      account,
      chainId,
      permitInfo,
    })

    const hooks = buildAppDataHooks([permitData])

    postOrderParams.appData = await updateHooksOnAppData(appData, hooks)
  } else {
    // Otherwise, remove hooks (if any) from appData to avoid stale data
    postOrderParams.appData = await updateHooksOnAppData(appData, undefined)
  }

  logTradeFlow('LIMIT ORDER FLOW', 'STEP 2: send transaction')
  tradeFlowAnalytics.trade(swapFlowAnalyticsContext)
  beforeTrade?.()

  const validTo = calculateLimitOrdersDeadline(settingsState)

  try {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 3: sign and post order')
    const { id: orderId, order } = await signAndPostOrder({
      ...postOrderParams,
      signer: provider.getSigner(),
      validTo,
    })
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 4: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !allowsOffchainSigning,
        },
      },
      dispatch
    )

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 5: presign order (optional)')
    const presignTx = await (allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, settlementContract))

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTx) {
      partialOrderUpdate(
        {
          chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: isGnosisSafeWallet ? presignTx.hash : undefined,
            isHidden: false,
          },
        },
        dispatch
      )
    }

    logTradeFlow('LIMIT ORDER FLOW', 'STEP 7: Sign order')
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return orderId
  } catch (error: any) {
    logTradeFlow('LIMIT ORDER FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
