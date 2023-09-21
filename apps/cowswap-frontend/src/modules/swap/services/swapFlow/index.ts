import { Web3Provider } from '@ethersproject/providers'
import { Percent, Token } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { buildAppDataHooks, updateHooksOnAppData } from 'modules/appData'
import { generatePermitHook } from 'modules/permit'
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

  if (input.permitInfo && !input.hasEnoughAllowance) {
    // If token is permittable and there's not enough allowance, get th permit hook

    // TODO: maybe we need a modal to inform the user what they need to sign?
    const permitData = await generatePermitHook({
      inputToken: input.context.trade.inputAmount.currency as Token,
      provider: input.orderParams.signer.provider as Web3Provider,
      account: input.orderParams.account,
      chainId: input.orderParams.chainId,
      permitInfo: input.permitInfo,
    })

    const hooks = buildAppDataHooks([permitData])

    input.orderParams.appData = await updateHooksOnAppData(input.orderParams.appData, hooks)
  } else {
    // Otherwise, remove hooks (if any) from appData to avoid stale data
    input.orderParams.appData = await updateHooksOnAppData(input.orderParams.appData, undefined)
  }

  logTradeFlow('SWAP FLOW', 'STEP 2: send transaction')
  tradeFlowAnalytics.trade(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logTradeFlow('SWAP FLOW', 'STEP 3: sign and post order')
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

    logTradeFlow('SWAP FLOW', 'STEP 4: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderId, input.contract))

    logTradeFlow('SWAP FLOW', 'STEP 5: unhide SC order (optional)')
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

    logTradeFlow('SWAP FLOW', 'STEP 6: show UI of the successfully sent transaction', orderId)
    input.swapConfirmManager.transactionSent(orderId)
    tradeFlowAnalytics.sign(input.swapFlowAnalyticsContext)
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 7: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, input.swapFlowAnalyticsContext)

    input.swapConfirmManager.setSwapError(swapErrorMessage)
  }
}
