import { CurrencyAmount } from '@uniswap/sdk-core'

import { hashOrder, packOrderUidParams } from '@cowprotocol/contracts'
import { CoWSwapEthFlow } from '@cow/abis/types'
import { logSwapFlow } from '@cow/modules/swap/services/utils/logger'
import { getOrderParams, PostOrderParams } from 'utils/trade'
import { getDomain } from 'utils/signatures'
import { MAX_VALID_TO_EPOCH } from '@cow/utils/time'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'

export interface UniqueOrderIdResult {
  orderId: string
  orderParams: PostOrderParams // most cases, will be the same as the ones in the parameter, but it might be modified to make the order unique
}

function incrementFee(params: PostOrderParams): PostOrderParams {
  const nativeCurrency = params.feeAmount?.currency

  if (!nativeCurrency) {
    throw new Error('Missing currency for Eth Flow Fee') // Not a realistic case, just to make TS happy
  }

  const oneWei = CurrencyAmount.fromRawAmount(nativeCurrency, 1)
  return {
    ...params,
    feeAmount: params.feeAmount?.add(oneWei), // Increment fee by one wei
  }
}

export async function calculateUniqueOrderId(
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow,
  existsInFlightOrderId: (orderId: string) => boolean
): Promise<UniqueOrderIdResult> {
  logSwapFlow('ETH FLOW', '[EthFlow::calculateUniqueOrderId] - Calculate unique order Id', orderParams)
  const { chainId } = orderParams

  const { order } = getOrderParams(orderParams)

  const domain = getDomain(chainId)
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

  if (existsInFlightOrderId(orderId)) {
    logSwapFlow('ETH FLOW', '[EthFlow::calculateOrderId] Collision detected', orderId)

    // Recursive call, increment one fee until we get an unique order Id
    return calculateUniqueOrderId(incrementFee(orderParams), ethFlowContract, existsInFlightOrderId)
  }

  logSwapFlow('ETH FLOW', '[EthFlow::calculateOrderId] Order Id is Unique', orderId)

  return {
    orderId,
    orderParams,
  }
}
