import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultAbiCoder } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

import { COMPOSABLE_COW_ADDRESS } from 'modules/advancedOrders'

import { IConditionalOrder } from 'abis/types/ComposableCoW'

import { TWAP_HANDLER_ADDRESS, TWAP_ORDER_STRUCT } from '../const'
import { TwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { TWAPOrder, TWAPOrderStruct } from '../types'

function getTwapOrderParamsStruct(
  chainId: SupportedChainId,
  order: TWAPOrder
): IConditionalOrder.ConditionalOrderParamsStruct {
  const twapOrderData: TWAPOrderStruct = {
    sellToken: order.sellAmount.currency.address,
    buyToken: order.buyAmount.currency.address,
    receiver: order.receiver,
    partSellAmount: order.sellAmount.divide(order.numOfParts).quotient.toString(),
    minPartLimit: order.buyAmount.divide(order.numOfParts).quotient.toString(),
    t0: order.startTime,
    n: order.numOfParts,
    t: order.timeInterval,
    span: order.span,
  }

  return {
    handler: TWAP_HANDLER_ADDRESS[chainId],
    salt: hexZeroPad(Buffer.from(Date.now().toString(16), 'hex'), 32),
    staticInput: defaultAbiCoder.encode([TWAP_ORDER_STRUCT], [twapOrderData]),
  }
}

export function createTwapOrderTxs(order: TWAPOrder, context: TwapOrderCreationContext): MetaTransactionData[] {
  const { chainId, composableCowContract, needsApproval, erc20Contract, spender } = context

  const sellTokenAddress = order.sellAmount.currency.address
  const sellAmountAtoms = order.sellAmount.quotient.toString()

  // TODO: support other conditional orders (stop loss, GAT, etc.)
  const creationParams = getTwapOrderParamsStruct(chainId, order)

  const createOrderTx = {
    to: COMPOSABLE_COW_ADDRESS[chainId],
    data: composableCowContract.interface.encodeFunctionData('create', [creationParams, true]),
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
