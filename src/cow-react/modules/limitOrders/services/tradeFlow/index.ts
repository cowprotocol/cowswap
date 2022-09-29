import { PostOrderParams, signAndPostOrder } from 'utils/trade'
import { presignOrderStep } from 'cow-react/modules/swap/services/swapFlow/steps/presignOrderStep'
import { addPendingOrderStep } from 'cow-react/modules/swap/services/swapFlow/steps/addPendingOrderStep'
import { GPv2Settlement } from 'abis/types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AppDispatch } from 'state'

export interface TradeFlowContext {
  postOrderParams: PostOrderParams
  settlementContract: GPv2Settlement
  chainId: SupportedChainId
  dispatch: AppDispatch
  allowsOffchainSigning: boolean
  isGnosisSafeWallet: boolean
}

// TODO: Add all necessary like cow-react/modules/swap/services/swapFlow/index.ts
export async function tradeFlow(params: TradeFlowContext) {
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
}
