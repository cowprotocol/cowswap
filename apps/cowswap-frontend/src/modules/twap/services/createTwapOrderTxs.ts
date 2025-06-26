import { MaxUint256 } from '@ethersproject/constants'
import type { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export function createTwapOrderTxs(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext,
): MetaTransactionData[] {
  const {
    composableCowContract,
    needsApproval,
    needsZeroApproval,
    erc20Contract,
    spender,
    currentBlockFactoryAddress,
  } = context

  const { sellAmount } = order

  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = MaxUint256.toString()

  const txs: MetaTransactionData[] = []

  const createOrderTx = {
    to: composableCowContract.address,
    data: composableCowContract.interface.encodeFunctionData('createWithContext', [
      paramsStruct,
      currentBlockFactoryAddress,
      '0x',
      true,
    ]),
    value: '0',
    operation: 0,
  }

  txs.push(createOrderTx)

  if (!needsApproval) return txs

  const approveTx = {
    to: sellTokenAddress,
    data: erc20Contract.interface.encodeFunctionData('approve', [spender, sellAmountAtoms]),
    value: '0',
    operation: 0,
  }

  txs.unshift(approveTx)

  if (!needsZeroApproval) return txs

  const zeroApproveTx = {
    to: sellAmount.currency.address,
    data: erc20Contract.interface.encodeFunctionData('approve', [spender, '0']),
    value: '0',
    operation: 0,
  }

  txs.unshift(zeroApproveTx)

  return txs
}
