import { encodeFunctionData, erc20Abi, maxUint256 } from 'viem'

import type { MetaTransactionData } from '@safe-global/types-kit'

import { getCreateTwapOrderCalldata } from './getTwapCreateCalldata'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export function getCreateTwapOrderTxs(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext,
): MetaTransactionData[] {
  const { composableCowContract, needsApproval, needsZeroApproval, spender, currentBlockFactoryAddress } = context

  if (!currentBlockFactoryAddress) {
    throw new Error('currentBlockFactoryAddress is required to create a TWAP order')
  }

  const { sellAmount } = order
  const sellTokenAddress = sellAmount.currency.address
  const sellAmountAtoms = maxUint256

  // At the very lest, we need the create order tx:
  const txs: MetaTransactionData[] = [{
    to: composableCowContract.address,
    data: getCreateTwapOrderCalldata({
      composableCowContractAbi: composableCowContract.abi,
      paramsStruct,
      currentBlockFactoryAddress,
    }),
    value: '0',
    operation: 0,
  }]

  if (!needsApproval) return txs

  // If we need to approve the sell token, we need to add the approve tx first:
  const approveTx = {
    to: sellTokenAddress,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as `0x${string}`, sellAmountAtoms],
    }),
    value: '0',
    operation: 0,
  }

  txs.unshift(approveTx)

  if (!needsZeroApproval) return txs

  // Some USDT-style tokens require resetting the allowance to zero before we set a new allowance:
  const zeroApproveTx = {
    to: sellTokenAddress,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as `0x${string}`, 0n],
    }),
    value: '0',
    operation: 0,
  }

  txs.unshift(zeroApproveTx)

  return txs
}
