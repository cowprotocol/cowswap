import { getTokenAddressKey } from '@cowprotocol/common-utils'

import { SetOptimisticAllowanceParams } from './useSetOptimisticAllowance'

export function getOptimisticAllowanceKey(
  params: Omit<SetOptimisticAllowanceParams, 'amount' | 'blockNumber'>,
): string {
  return `${params.chainId}-${getTokenAddressKey(params.tokenAddress)}-${getTokenAddressKey(params.owner)}-${getTokenAddressKey(params.spender)}`
}
