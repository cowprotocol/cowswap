import { getIsNativeToken, reportAppDataWithHooks, reportPermitWithDefaultSigner } from '@cowprotocol/common-utils'
import { CowEvents } from '@cowprotocol/events'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { updateHooksOnAppData } from 'modules/appData'
import { handlePermit } from 'modules/permit'
import { appDataContainsHooks } from 'modules/permit/utils/appDataContainsHooks'
import { appDataContainsPermitSigner } from 'modules/permit/utils/appDataContainsPermitSigner'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { tradeFlowAnalytics } from 'modules/trade/utils/analytics'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

import { presignOrderStep } from './steps/presignOrderStep'

import { SwapFlowContext } from '../types'

export async function swapFlow(
  input: SwapFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
): Promise<void | false> {
  const { tradeConfirmActions } = input

  const {
    context: {
      trade: { inputAmount, outputAmount },
    },
  } = input
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(input.permitInfo)) {
      tradeConfirmActions.requestPermitSignature(tradeAmounts)
    }

    input.orderParams.appData = await handlePermit({
      appData: input.orderParams.appData,
      inputToken: input.context.trade.inputAmount.currency,
      account: input.orderParams.account,
      permitInfo: input.permitInfo,
      generatePermitHook: input.generatePermitHook,
    })

    if (appDataContainsPermitSigner(input.orderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(input.orderParams)
    } else if (
      // TODO: remove once we figure out what's adding this to appData in the first place
      // Last resort in case of a race condition
      // It should not have a permit in the first place if it's selling native
      // But there are several cases where it has
      getIsNativeToken(input.context.trade.inputAmount.currency) &&
      appDataContainsHooks(input.orderParams.appData.fullAppData)
    ) {
      reportAppDataWithHooks(input.orderParams)
      // wipe out the hooks
      input.orderParams.appData = await updateHooksOnAppData(input.orderParams.appData, undefined)
    }

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    tradeFlowAnalytics.trade(input.swapFlowAnalyticsContext)

    tradeConfirmActions.onSign(tradeAmounts)

    logTradeFlow('SWAP FLOW', 'STEP 4: sign and post order')
    const { id: orderId, order } = await signAndPostOrder(input.orderParams).finally(() => {
      input.callbacks.closeModals()
    })

    addPendingOrderStep(
      {
        id: orderId,
        chainId: input.context.chainId,
        order: {
          ...order,
          isHidden: !input.flags.allowsOffchainSigning,
        },
      },
      input.dispatch
    )

    logTradeFlow('SWAP FLOW', 'STEP 5: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, input.contract))

    input.cowEventEmitter.emit(CowEvents.ON_POSTED_ORDER, { orderUid: orderId, chainId: input.context.chainId })

    logTradeFlow('SWAP FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTx) {
      partialOrderUpdate(
        {
          chainId: input.context.chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: input.flags.isGnosisSafeWallet ? presignTx.hash : undefined,
            isHidden: false,
          },
        },
        input.dispatch
      )
    }

    logTradeFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    tradeFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
