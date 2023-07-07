import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { ConditionalOrderParams, TWAPOrder } from '../types'

export function createTwapOrderTxs(
  order: TWAPOrder,
  paramsStruct: ConditionalOrderParams,
  context: TwapOrderCreationContext
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
  const sellAmountAtoms = sellAmount.quotient.toString()

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

  const zeroAmount = CurrencyAmount.fromRawAmount(sellAmount.currency, 0).toFixed(0)

  const zeroApproveTx = {
    to: sellAmount.currency.address,
    data: erc20Contract.interface.encodeFunctionData('approve', [spender, zeroAmount]),
    value: '0',
    operation: 0,
  }

  txs.unshift(zeroApproveTx)

  return txs
}
