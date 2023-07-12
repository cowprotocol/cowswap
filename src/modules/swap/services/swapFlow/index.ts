import { MaxUint256, Percent, Token } from '@uniswap/sdk-core'

import { splitSignature } from 'ethers/lib/utils'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { signAndPostOrder } from 'legacy/utils/trade'

import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { getSwapErrorMessage } from 'modules/trade/utils/swapErrorHelper'

import { presignOrderStep } from './steps/presignOrderStep'

import { GP_VAULT_RELAYER } from '../../../../legacy/constants'
import { getAddress } from '../../../../utils/getAddress'
import { toKeccak256 } from '../../../appData/utils/buildAppData'
import { tradeFlowAnalytics } from '../../../trade/utils/analytics'
import { SwapFlowContext } from '../types'

export async function swapFlow(
  input: SwapFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>
) {
  // TODO
  const isTokenSupportsEIP2612 = true

  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return
  }

  let newAppData = null

  if (isTokenSupportsEIP2612) {
    const sellTokenContract = input.sellTokenContract
    const inputToken = input.context.trade.inputAmount.currency
    const nonce = await sellTokenContract?.nonces(input.orderParams.account)

    const permit = {
      owner: input.orderParams.account,
      spender: GP_VAULT_RELAYER[input.orderParams.chainId],
      value: BigInt(input.context.trade.inputAmount.toExact()).toString(16),
      nonce: nonce ? nonce.toNumber() : 0,
      deadline: MaxUint256.toString(),
    }
    const permitSignature = splitSignature(
      await (input.orderParams.signer.provider as any).getSigner()._signTypedData(
        {
          name: inputToken.name,
          version: BigInt(1).toString(16), // TODO
          chainId: inputToken.chainId,
          verifyingContract: (inputToken as Token).address,
        },
        {
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        permit
      )
    )

    const permitParams = [
      permit.owner,
      permit.spender,
      permit.value,
      permit.deadline,
      permitSignature.v,
      permitSignature.r,
      permitSignature.s,
    ]
    const permitHook = {
      target: getAddress(inputToken),
      callData: sellTokenContract?.interface.encodeFunctionData('permit', permitParams as any),
      gasLimit: BigInt(12_000_000).toString(16),
    }
    newAppData = toKeccak256(
      JSON.stringify({
        backend: {
          hooks: {
            pre: [permitHook],
          },
        },
      })
    )
  }

  logTradeFlow('SWAP FLOW', 'STEP 2: send transaction')
  tradeFlowAnalytics.trade(input.swapFlowAnalyticsContext)
  input.swapConfirmManager.sendTransaction(input.context.trade)

  try {
    logTradeFlow('SWAP FLOW', 'STEP 3: sign and post order')
    const { id: orderId, order } = await signAndPostOrder(input.orderParams, newAppData).finally(() => {
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
