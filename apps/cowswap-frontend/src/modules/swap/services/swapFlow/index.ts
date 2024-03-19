import {
  getAddress,
  getIsNativeToken,
  reportAppDataWithHooks,
  reportPermitWithDefaultSigner,
} from '@cowprotocol/common-utils'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { updateHooksOnAppData } from 'modules/appData'
import { emitPostedOrderEvent } from 'modules/orders'
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
  const {
    tradeConfirmActions,
    callbacks: { getCachedPermit },
  } = input

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

  const { orderParams, context, permitInfo, generatePermitHook, swapFlowAnalyticsContext, callbacks, dispatch } = input
  const { chainId, trade } = context
  const inputCurrency = trade.inputAmount.currency
  const cachedPermit = await getCachedPermit(getAddress(inputCurrency))

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (isSupportedPermitInfo(permitInfo) && !cachedPermit) {
      tradeConfirmActions.requestPermitSignature(tradeAmounts)
    }

    const { appData, account, isSafeWallet, recipientAddressOrName, inputAmount, outputAmount, kind } = orderParams
    orderParams.appData = await handlePermit({
      appData,
      account,
      inputToken: inputCurrency,
      permitInfo,
      generatePermitHook,
    })

    if (appDataContainsPermitSigner(orderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(orderParams)
    } else if (
      // TODO: remove once we figure out what's adding this to appData in the first place
      // Last resort in case of a race condition
      // It should not have a permit in the first place if it's selling native
      // But there are several cases where it has
      getIsNativeToken(inputCurrency) &&
      appDataContainsHooks(orderParams.appData.fullAppData)
    ) {
      reportAppDataWithHooks(orderParams)
      // wipe out the hooks
      orderParams.appData = await updateHooksOnAppData(orderParams.appData, undefined)
    }

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    tradeFlowAnalytics.trade(swapFlowAnalyticsContext)

    tradeConfirmActions.onSign(tradeAmounts)

    logTradeFlow('SWAP FLOW', 'STEP 4: sign and post order')
    const { id: orderUid, order } = await signAndPostOrder(orderParams).finally(() => {
      callbacks.closeModals()
    })

    addPendingOrderStep(
      {
        id: orderUid,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !input.flags.allowsOffchainSigning,
        },
        isSafeWallet,
      },
      dispatch
    )

    logTradeFlow('SWAP FLOW', 'STEP 5: presign order (optional)')
    const presignTx = await (input.flags.allowsOffchainSigning
      ? Promise.resolve(null)
      : presignOrderStep(orderUid, input.contract))

    emitPostedOrderEvent({
      chainId,
      id: orderUid,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
    })

    logTradeFlow('SWAP FLOW', 'STEP 6: unhide SC order (optional)')
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

    logTradeFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderUid)
    tradeConfirmActions.onSuccess(orderUid)
    tradeFlowAnalytics.sign(swapFlowAnalyticsContext)
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error)

    tradeFlowAnalytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
