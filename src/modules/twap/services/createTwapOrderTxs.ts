import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export function createTwapOrderTxs(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext
): MetaTransactionData[] {
  const { composableCowContract, needsApproval, erc20Contract, spender } = context

  const sellTokenAddress = order.sellAmount.currency.address
  const sellAmountAtoms = order.sellAmount.quotient.toString()

  const createOrderTx = {
    to: composableCowContract.address,
    data: composableCowContract.interface.encodeFunctionData('create', [paramsStruct, true]),
    value: '0',
    operation: 0,
  }

  if (!needsApproval) return [createOrderTx]

  const approveTx = {
    to: sellTokenAddress,
    data: erc20Contract.interface.encodeFunctionData('approve', [spender, sellAmountAtoms]),
    value: '0',
    operation: 0,
  }

  return [approveTx, createOrderTx]
}
