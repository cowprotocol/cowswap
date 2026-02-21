import type { MetaTransactionData } from '@safe-global/types-kit'

import { encodeFunctionData, erc20Abi, maxUint256 } from 'viem'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export function createTwapOrderTxs(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext,
): MetaTransactionData[] {
  const { composableCowContract, needsApproval, needsZeroApproval, spender, currentBlockFactoryAddress } = context

  const { sellAmount } = order

  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  const txs: MetaTransactionData[] = []

  const createOrderTx = {
    to: composableCowContract.address,
    data: encodeFunctionData({
      abi: composableCowContract.abi,
      functionName: 'createWithContext',
      args: [paramsStruct, currentBlockFactoryAddress, '0x', true],
    }),
    value: '0',
    operation: 0,
  }

  txs.push(createOrderTx)

  if (!needsApproval) return txs

  const approveTx = {
    to: sellTokenAddress,
    data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, sellAmountAtoms] }),
    value: '0',
    operation: 0,
  }

  txs.unshift(approveTx)

  if (!needsZeroApproval) return txs

  const zeroApproveTx = {
    to: sellAmount.currency.address,
    data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, 0n] }),
    value: '0',
    operation: 0,
  }

  txs.unshift(zeroApproveTx)

  return txs
}
