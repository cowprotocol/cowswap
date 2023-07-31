import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { defaultAbiCoder } from '@ethersproject/abi'
import { hexZeroPad } from '@ethersproject/bytes'

import { twapOrderToStruct } from './twapOrderToStruct'

import { TWAP_HANDLER_ADDRESS, TWAP_ORDER_STRUCT } from '../const'
import { ConditionalOrderParams, TWAPOrder } from '../types'

// TODO: support other conditional orders (stop loss, GAT, etc.)
export function buildTwapOrderParamsStruct(chainId: SupportedChainId, order: TWAPOrder): ConditionalOrderParams {
  const twapOrderData = twapOrderToStruct(order)

  return {
    handler: TWAP_HANDLER_ADDRESS[chainId],
    salt: hexZeroPad(Buffer.from(Date.now().toString(16), 'hex'), 32),
    staticInput: defaultAbiCoder.encode([TWAP_ORDER_STRUCT], [twapOrderData]),
  }
}
