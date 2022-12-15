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

export async function calculateUniqueOrderId(
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow
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

  logSwapFlow('ETH FLOW', '[EthFlow::calculateOrderId] Calculate Order Id', orderId)

  // TODO: Detect if there's another order that has been created with the same order Id
  // TODO: Detect collisions using the API (orderId exists)
  // TODO: Do recursive call: calculateUniqueOrderId(incrementFee(orderParams), ethFlowContract)

  return {
    orderId,
    orderParams,
  }
}
