import { NativeCurrency } from '@uniswap/sdk-core'
import { ContractTransaction } from '@ethersproject/contracts'

import { CoWSwapEthFlow } from '@cow/abis/types'
import { logSwapFlow, logSwapFlowError } from '@cow/modules/swap/services/utils/logger'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from 'utils/trade'
import { UnsignedOrder } from 'utils/signatures'
import { Order, OrderClass } from 'state/orders/actions'
import { ETHFLOW_GAS_LIMIT_DEFAULT } from '@cow/modules/swap/services/ethFlow/const'

type EthFlowOrderParams = Omit<PostOrderParams, 'sellToken'> & {
  sellToken: NativeCurrency
}

export type EthFlowCreateOrderParams = Omit<UnsignedOrder, 'quoteId' | 'appData' | 'validTo' | 'orderId'> & {
  quoteId: number
  appData: string
  validTo: string
  summary: string
}

export type EthFlowResponse = {
  txReceipt: ContractTransaction
  order: Order
}

export type EthFlowSwapCallback = (orderParams: EthFlowOrderParams) => Promise<EthFlowResponse>

export async function signEthFlowOrderStep(
  orderId: string,
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow
): Promise<EthFlowResponse> {
  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] - signing orderParams onchain', orderParams)

  const { order, quoteId, summary } = getOrderParams(orderParams)

  if (!quoteId) {
    throw new Error('[EthFlow::SignEthFlowOrderStep] No quoteId passed')
  }

  const auxOrderParams: EthFlowCreateOrderParams = {
    ...order,
    quoteId,
    appData: order.appData.toString(),
    validTo: order.validTo.toString(),
    summary,
  }

  const estimatedGas = await ethFlowContract.estimateGas
    .createOrder(auxOrderParams, { value: orderParams.sellAmountBeforeFee.quotient.toString() })
    .catch((error) => {
      logSwapFlowError(
        'ETH FLOW',
        '[EthFlow::SignEthFlowOrderStep] Error estimating createOrder gas. Using default ' + ETHFLOW_GAS_LIMIT_DEFAULT,
        error
      )
      return ETHFLOW_GAS_LIMIT_DEFAULT
    })

  const txReceipt = await ethFlowContract.createOrder(auxOrderParams, {
    gasLimit: calculateGasMargin(estimatedGas),
    value: orderParams.sellAmountBeforeFee.quotient.toString(),
  })

  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] Sent transaction onchain', orderId, txReceipt)

  return {
    txReceipt,
    order: mapUnsignedOrderToOrder({
      unsignedOrder: order,
      additionalParams: {
        ...orderParams,
        // For ETH-flow we always set order class to 'market' since we don't support ETH-flow in Limit orders
        class: OrderClass.MARKET,
        orderId,
        signature: '',
        summary,
        quoteId,
        orderCreationHash: txReceipt.hash,
        isOnChain: true, // always on-chain
      },
    }),
  }
}
