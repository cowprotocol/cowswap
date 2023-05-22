import { NativeCurrency } from '@uniswap/sdk-core'
import { ContractTransaction } from '@ethersproject/contracts'

import { CoWSwapEthFlow } from 'abis/types/ethflow'
import { logTradeFlow, logTradeFlowError } from 'modules/trade/utils/logger'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { getOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from 'legacy/utils/trade'
import { Order } from 'legacy/state/orders/actions'
import { OrderClass, UnsignedOrder } from '@cowprotocol/cow-sdk'
import { ETHFLOW_GAS_LIMIT_DEFAULT } from 'modules/swap/services/ethFlow/const'

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
  ethFlowContract: CoWSwapEthFlow,
  addInFlightOrderId: (orderId: string) => void
): Promise<EthFlowResponse> {
  logTradeFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] - signing orderParams onchain', orderParams)

  const etherValue = orderParams.sellAmountBeforeFee
  const { order, quoteId, summary } = getOrderParams(orderParams)

  if (!quoteId) {
    throw new Error('[EthFlow::SignEthFlowOrderStep] No quoteId passed')
  }

  const ethOrderParams: EthFlowCreateOrderParams = {
    ...order,
    quoteId,
    appData: order.appData.toString(),
    validTo: order.validTo.toString(),
    summary,
  }

  const ethTxOptions = { value: etherValue.quotient.toString() }
  const estimatedGas = await ethFlowContract.estimateGas
    .createOrder(ethOrderParams, { value: etherValue.quotient.toString() })
    .catch((error) => {
      logTradeFlowError(
        'ETH FLOW',
        '[EthFlow::SignEthFlowOrderStep] Error estimating createOrder gas. Using default ' + ETHFLOW_GAS_LIMIT_DEFAULT,
        error
      )
      return ETHFLOW_GAS_LIMIT_DEFAULT
    })

  const txReceipt = await ethFlowContract.createOrder(ethOrderParams, {
    ...ethTxOptions,
    gasLimit: calculateGasMargin(estimatedGas),
  })
  addInFlightOrderId(orderId)

  logTradeFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] Sent transaction onchain', orderId, txReceipt)

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
