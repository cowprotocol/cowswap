import { CoWSwapEthFlow } from '@cowprotocol/abis'
import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { MAX_VALID_TO_EPOCH } from '@cowprotocol/common-utils'
import type { Order } from '@cowprotocol/contracts'
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getSignOrderParams, PostOrderParams } from 'legacy/utils/trade'

import { logTradeFlow } from 'modules/trade/utils/logger'

import { EthFlowOrderExistsCallback } from '../../../hooks/useCheckEthFlowOrderExists'

export interface UniqueOrderIdResult {
  orderId: string
  orderParams: PostOrderParams // most cases, will be the same as the ones in the parameter, but it might be modified to make the order unique
}

function adjustAmounts(params: PostOrderParams): PostOrderParams {
  const nativeCurrency = params.feeAmount?.currency
  const buyCurrency = params.outputAmount?.currency

  if (!nativeCurrency || !buyCurrency) {
    throw new Error('Missing currency for Eth Flow Fee') // Not a realistic case, just to make TS happy
  }

  // On fee=0, fee is, well, 0. Thus, we cannot shift amounts around and remain with the exact same price.
  // Also, we don't want to touch the sell amount.
  // If we move it down, the price might become "too good", if we move it up, the user might not have enough funds!
  // Thus, we make the buy amount a tad bit worse by 1 wei.
  // We can only hope this doesn't happen for an order buying 0 a decimals token 🤞
  const oneBuyWei = CurrencyAmount.fromRawAmount(buyCurrency, 1)
  return { ...params, outputAmount: params.outputAmount?.subtract(oneBuyWei) }
}

export async function calculateUniqueOrderId(
  orderParams: PostOrderParams,
  ethFlowContract: CoWSwapEthFlow,
  checkEthFlowOrderExists: EthFlowOrderExistsCallback,
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
    sellToken: WRAPPED_NATIVE_CURRENCIES[chainId].address,
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
    return calculateUniqueOrderId(adjustAmounts(orderParams), ethFlowContract, checkEthFlowOrderExists)
  }

  logTradeFlow('ETH FLOW', '[calculateUniqueOrderId] ✅ Order Id is Unique' + orderId, logParams)

  return {
    orderId,
    orderParams,
  }
}
