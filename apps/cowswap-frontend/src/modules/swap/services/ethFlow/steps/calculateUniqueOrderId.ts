import type { Order } from '@cowprotocol/contracts'
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { CoWSwapEthFlow } from '@cowswap/abis'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'
import { getSignOrderParams, PostOrderParams } from 'legacy/utils/trade'

import { logTradeFlow } from 'modules/trade/utils/logger'

import { MAX_VALID_TO_EPOCH } from 'utils/time'

import { EthFlowOrderExistsCallback } from '../../../hooks/useCheckEthFlowOrderExists'

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
  checkEthFlowOrderExists: EthFlowOrderExistsCallback
): Promise<UniqueOrderIdResult> {
  logTradeFlow('ETH FLOW', '[EthFlow::calculateUniqueOrderId] - Calculate unique order Id', orderParams)
  const { chainId } = orderParams

  const { order } = getSignOrderParams(orderParams)

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
  if (await checkEthFlowOrderExists(orderId, orderDigest)) {
    logTradeFlow('ETH FLOW', '[calculateUniqueOrderId] ❌ Collision detected: ' + orderId, logParams)

    // Recursive call, increment one fee until we get an unique order Id
    return calculateUniqueOrderId(incrementFee(orderParams), ethFlowContract, checkEthFlowOrderExists)
  }

  logTradeFlow('ETH FLOW', '[calculateUniqueOrderId] ✅ Order Id is Unique' + orderId, logParams)

  return {
    orderId,
    orderParams,
  }
}
