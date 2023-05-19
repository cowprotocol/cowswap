import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { Percent } from '@uniswap/sdk-core'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { LOW_RATE_THRESHOLD_PERCENT } from 'modules/limitOrders/const/trade'
import { calculateLimitOrdersDeadline } from 'modules/limitOrders/utils/calculateLimitOrdersDeadline'
import { signAndPostOrder } from 'legacy/utils/trade'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { buildApproveTx } from 'modules/operations/bundle/buildApproveTx'
import { buildPresignTx } from 'modules/operations/bundle/buildPresignTx'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'
import { SwapFlowAnalyticsContext, tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { PriceImpactDeclineError, SafeBundleFlowContext } from 'modules/limitOrders/services/types'

const LOG_PREFIX = 'LIMIT ORDER SAFE BUNDLE FLOW'

export async function safeBundleFlow(
  params: SafeBundleFlowContext,
  priceImpact: PriceImpact,
  settingsState: LimitOrdersSettingsState,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  beforeTrade?: () => void
): Promise<string | null> {
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
    class: orderClass,
  } = params.postOrderParams

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

  const {
    chainId,
    postOrderParams,
    provider,
    erc20Contract,
    spender,
    dispatch,
    appData,
    settlementContract,
    safeAppsSdk,
    addAppDataToUploadQueue,
  } = params

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

    logTradeFlow(LOG_PREFIX, 'STEP 4: build presign tx')
    const presignTx = await buildPresignTx({ settlementContract, orderId })

    logTradeFlow(LOG_PREFIX, 'STEP 5: send safe tx')
    const safeTransactionData: MetaTransactionData[] = [
      { to: approveTx.to!, data: approveTx.data!, value: '0', operation: 0 },
      { to: presignTx.to!, data: presignTx.data!, value: '0', operation: 0 },
    ]

    const safeTx = await safeAppsSdk.txs.send({ txs: safeTransactionData })

    logTradeFlow(LOG_PREFIX, 'STEP 6: add pending order step')
    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          presignGnosisSafeTxHash: safeTx.safeTxHash,
        },
      },
      dispatch
    )

    logTradeFlow(LOG_PREFIX, 'STEP 6: add app data to upload queue')
    addAppDataToUploadQueue({ chainId, orderId, appData })

    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)

    return orderId
  } catch (error: any) {
    logTradeFlow(LOG_PREFIX, 'STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    throw error
  }
}
