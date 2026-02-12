import { encodeAbiParameters, keccak256 } from 'viem'

import { ConditionalOrderParams } from '../types'

const CONDITIONAL_ORDER_PARAMS_STRUCT = {
  type: 'tuple',
  components: [
    { name: 'handler', type: 'address' },
    { name: 'salt', type: 'bytes32' },
    { name: 'staticInput', type: 'bytes' },
  ],
}

export function getConditionalOrderId(params: ConditionalOrderParams): string {
  return keccak256(encodeAbiParameters([CONDITIONAL_ORDER_PARAMS_STRUCT], [params]))
}
