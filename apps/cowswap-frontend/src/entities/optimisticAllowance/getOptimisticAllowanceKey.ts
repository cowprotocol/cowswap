import { getTokenAddressKey } from '@cowprotocol/cow-sdk'

import { SetOptimisticAllowanceParams } from './useSetOptimisticAllowance'

export function getOptimisticAllowanceKey(
  params: Omit<SetOptimisticAllowanceParams, 'amount' | 'blockNumber'>,
): string {
  return `${params.chainId}-${getTokenAddressKey(params.tokenAddress)}-${getTokenAddressKey(params.owner)}-${getTokenAddressKey(params.spender)}`
}
