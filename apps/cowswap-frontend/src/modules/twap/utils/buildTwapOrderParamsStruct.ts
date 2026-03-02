import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { padHex, toHex, encodeAbiParameters } from 'viem'

import { twapOrderToStruct } from './twapOrderToStruct'

import { TWAP_HANDLER_ADDRESS, TWAP_ORDER_STRUCT } from '../const'
import { ConditionalOrderParams, TWAPOrder } from '../types'

// TODO: support other conditional orders (stop loss, GAT, etc.)
export function buildTwapOrderParamsStruct(chainId: SupportedChainId, order: TWAPOrder): ConditionalOrderParams {
  const { partSellAmount, minPartLimit, t0, n, t, span, ...rest } = twapOrderToStruct(order)

  return {
    handler: TWAP_HANDLER_ADDRESS[chainId],
    salt: padHex(toHex(Date.now()), { size: 32 }),
    staticInput: encodeAbiParameters(TWAP_ORDER_STRUCT, [
      {
        ...rest,
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
