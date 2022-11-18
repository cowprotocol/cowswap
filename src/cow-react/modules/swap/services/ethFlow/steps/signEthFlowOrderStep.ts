import { NativeCurrency } from '@uniswap/sdk-core'
import { BigNumber } from '@ethersproject/bignumber'
import { ContractTransaction } from '@ethersproject/contracts'

import { hashOrder, packOrderUidParams } from '@cowprotocol/contracts'
import { CoWSwapEthFlow } from '@cow/abis/types'
import { logSwapFlow, logSwapFlowError } from '@cow/modules/swap/services/utils/logger'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { getOrderParams, mapUnsignedOrderToOrder, PostOrderParams } from 'utils/trade'
import { getDomain, UnsignedOrder } from 'utils/signatures'
import { Order } from 'state/orders/actions'
import { MAX_VALID_TO_EPOCH } from '@cow/utils/time'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

type EthFlowOrderParams = Omit<PostOrderParams, 'sellToken'> & {
  sellToken: NativeCurrency
}

export type EthFlowCreateOrderParams = Omit<UnsignedOrder, 'quoteId' | 'appData' | 'validTo' | 'orderId'> & {
  quoteId: number
  appData: string
  validTo: string
  summary: string
}
export type EthFlowResponse = { txReceipt: ContractTransaction; order: Order; orderId: string }
export type EthFlowSwapCallback = (orderParams: EthFlowOrderParams) => Promise<EthFlowResponse>

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const ETHFLOW_GAS_LIMIT_DEFAULT = BigNumber.from('150000')

export async function signEthFlowOrderStep(
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow
): Promise<EthFlowResponse> {
  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] - signing orderParams onchain', orderParams)
  const { chainId } = orderParams

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

  const domain = getDomain(orderParams.chainId)
  // Different validTo when signing because EthFlow contract expects it to be max for all orders
  const orderDigest = hashOrder(domain, {
    ...order,
    validTo: MAX_VALID_TO_EPOCH,
    sellToken: WRAPPED_NATIVE_CURRENCY[chainId].address,
  })
  // Generate the orderId from owner, orderDigest, and max validTo
  const orderId = packOrderUidParams({
    orderDigest,
    owner: ethFlowContract.address,
    validTo: MAX_VALID_TO_EPOCH,
  })

  logSwapFlow('ETH FLOW', '[EthFlow::SignEthFlowOrderStep] Sent transaction onchain', orderId, txReceipt)

  return {
    txReceipt,
    order: mapUnsignedOrderToOrder({
      unsignedOrder: order,
      additionalParams: {
        ...orderParams,
        // For ETH-flow we always set order class to 'market' since we don't support ETH-flow in Limit orders
        class: 'market',
        orderId,
        signature: '',
        summary,
        orderCreationHash: txReceipt.hash,
        isOnChain: true, // always on-chain
      },
    }),
    orderId,
  }
}
