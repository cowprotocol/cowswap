import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { handlePermit } from 'modules/permit'
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
) {
  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return
  }

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(input.permitInfo)) input.swapConfirmManager.requestPermitSignature()

    input.orderParams.appData = await handlePermit({
      appData: input.orderParams.appData,
      inputToken: input.context.trade.inputAmount.currency,
      account: input.orderParams.account,
      permitInfo: input.permitInfo,
      generatePermitHook: input.generatePermitHook,
    })
    input.swapConfirmManager.permitSigned()

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    tradeFlowAnalytics.trade(input.swapFlowAnalyticsContext)
    input.swapConfirmManager.sendTransaction(input.context.trade)

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
    input.swapConfirmManager.transactionSent(orderId)
    tradeFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
