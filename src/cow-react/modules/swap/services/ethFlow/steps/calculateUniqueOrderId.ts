import { CurrencyAmount } from '@uniswap/sdk-core'

import type { Order } from '@cowprotocol/contracts'
import { CoWSwapEthFlow } from '@cow/abis/types'
import { logTradeFlow } from '@cow/modules/trade/utils/logger'
import { getOrderParams, PostOrderParams } from 'utils/trade'
import { MAX_VALID_TO_EPOCH } from '@cow/utils/time'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'

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
    inputAmount: params.inputAmount?.subtract(oneWei), // Deduct the sellAmount so the ETH sent is the same
  }
}

export async function calculateUniqueOrderId(
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow,
  checkInFlightOrderIdExists: (orderId: string) => boolean
): Promise<UniqueOrderIdResult> {
  logTradeFlow('ETH FLOW', '[EthFlow::calculateUniqueOrderId] - Calculate unique order Id', orderParams)
  const { chainId } = orderParams

  const { order } = getOrderParams(orderParams)

  const { hashOrder, packOrderUidParams } = await import('@cowprotocol/contracts')
  const domain = await OrderSigningUtils.getDomain(chainId)
  // Different validTo when signing because EthFlow contract expects it to be max for all orders
  const orderDigest = hashOrder(domain, {
    ...order,
    validTo: MAX_VALID_TO_EPOCH,
    sellToken: WRAPPED_NATIVE_CURRENCY[chainId].address,
  } as Order)
  // Generate the orderId from owner, orderDigest, and max validTo
  const orderId = packOrderUidParams({
    orderDigest,
    owner: ethFlowContract.address,
    validTo: MAX_VALID_TO_EPOCH,
  })

  const logParams = {
    sellAmount: orderParams.inputAmount.quotient.toString(),
    fee: orderParams.feeAmount?.quotient.toString(),
  }
  if (checkInFlightOrderIdExists(orderId)) {
    logTradeFlow('ETH FLOW', '[calculateUniqueOrderId] ❌ Collision detected: ' + orderId, logParams)

    // Recursive call, increment one fee until we get an unique order Id
    return calculateUniqueOrderId(incrementFee(orderParams), ethFlowContract, checkInFlightOrderIdExists)
  }

  logTradeFlow('ETH FLOW', '[calculateUniqueOrderId] ✅ Order Id is Unique' + orderId, logParams)

  return {
    orderId,
    orderParams,
  }
}
