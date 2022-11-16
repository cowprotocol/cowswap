import { PostOrderParams, signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from '@cow/modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from '@cow/modules/swap/services/common/steps/addPendingOrderStep'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AppDispatch } from 'state'
import { GPv2Settlement } from '@cow/abis/types'
import confirmPriceImpactWithoutFee from '@src/components/swap/confirmPriceImpactWithoutFee'
import { PriceImpact } from 'hooks/usePriceImpact'

export interface TradeFlowContext {
  postOrderParams: PostOrderParams
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
}

export class PriceImpactDeclineError extends Error {}

export async function tradeFlow(
  params: TradeFlowContext,
  priceImpact: PriceImpact,
  beforeTrade?: () => void
): Promise<string> {
  if (priceImpact.priceImpact && !confirmPriceImpactWithoutFee(priceImpact.priceImpact)) {
    throw new PriceImpactDeclineError()
  }

  beforeTrade?.()

  const { id: orderId, order } = await signAndPostOrder(params.postOrderParams)

  const presignTx = await (params.allowsOffchainSigning
    ? Promise.resolve(null)
    : presignOrderStep(orderId, params.settlementContract))

  addPendingOrderStep(
    {
      id: orderId,
      chainId: params.chainId,
      order: {
        ...order,
        presignGnosisSafeTxHash: params.isGnosisSafeWallet && presignTx ? presignTx.hash : undefined,
      },
    },
    params.dispatch
  )

  return orderId
}
