import { ComposableCoW, GPv2Settlement } from '@cowprotocol/abis'
import { BigNumber } from '@ethersproject/bignumber'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

export interface CancelTwapOrderContext {
  composableCowContract: ComposableCoW
  settlementContract: GPv2Settlement
  orderId: string
  partOrderId?: string
}
export function cancelTwapOrderTxs(context: CancelTwapOrderContext): MetaTransactionData[] {
  const { composableCowContract, settlementContract, orderId, partOrderId } = context
  const cancelTwapOrderTx = {
    to: composableCowContract.address,
    data: composableCowContract.interface.encodeFunctionData('remove', [orderId]),
    value: '0',
    operation: 0,
  }

  if (!partOrderId) return [cancelTwapOrderTx]

  const cancelTwapPartOrderTx = {
    to: settlementContract.address,
    data: settlementContract.interface.encodeFunctionData('invalidateOrder', [partOrderId]),
    value: '0',
    operation: 0,
  }

  return [cancelTwapOrderTx, cancelTwapPartOrderTx]
}

export async function estimateCancelTwapOrderTxs(context: CancelTwapOrderContext): Promise<BigNumber> {
  const { composableCowContract, settlementContract, orderId, partOrderId } = context
  const canelComposableCowTxCost = await composableCowContract.estimateGas.remove(orderId)

  if (!partOrderId) return canelComposableCowTxCost

  const cancelPartOrderTx = await settlementContract.estimateGas.invalidateOrder(partOrderId)

  return canelComposableCowTxCost.add(cancelPartOrderTx)
}
