import { defaultAbiCoder } from '@ethersproject/abi'
import { keccak256 } from '@ethersproject/keccak256'

import { ConditionalOrderParams } from '../types'

const CONDITIONAL_ORDER_PARAMS_STRUCT = 'tuple(address handler, bytes32 salt, bytes staticInput)'

export function getConditionalOrderId(params: ConditionalOrderParams): string {
  return keccak256(defaultAbiCoder.encode([CONDITIONAL_ORDER_PARAMS_STRUCT], [params]))
}
