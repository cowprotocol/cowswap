import { encodeAbiParameters, padHex, toHex, type Hex } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { twapOrderToStruct } from './twapOrderToStruct'

import { TWAP_HANDLER_ADDRESS, TWAP_ORDER_STRUCT } from '../const'
import { ConditionalOrderParams, TWAPOrder } from '../types'

// TODO: support other conditional orders (stop loss, GAT, etc.)
export function buildTwapOrderParamsStruct(
  chainId: SupportedChainId,
  order: TWAPOrder,
  salt?: Hex,
): ConditionalOrderParams {
  const { partSellAmount, minPartLimit, t0, n, t, span, ...rest } = twapOrderToStruct(order)

  return {
    handler: TWAP_HANDLER_ADDRESS[chainId] as `0x${string}`,
    salt: salt ?? padHex(toHex(Date.now()), { size: 32 }),
    staticInput: encodeAbiParameters(TWAP_ORDER_STRUCT, [
      {
        ...rest,
        sellToken: rest.sellToken as `0x${string}`,
        buyToken: rest.buyToken as `0x${string}`,
        receiver: rest.receiver as `0x${string}`,
        appData: rest.appData as `0x${string}`,
        partSellAmount: BigInt(partSellAmount),
        minPartLimit: BigInt(minPartLimit),
        t0: BigInt(t0),
        n: BigInt(n),
        t: BigInt(t),
        span: BigInt(span),
      },
    ]),
  }
}

/** Random 32-byte salt shared by TWAP params, poller schedule id, and registerWithSignature. */
export function createTwapOrderSalt(): Hex {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}
