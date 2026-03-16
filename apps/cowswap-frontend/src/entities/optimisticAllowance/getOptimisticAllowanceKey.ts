import { getAddressKey } from '@cowprotocol/cow-sdk'

import { SetOptimisticAllowanceParams } from './useSetOptimisticAllowance'

export function getOptimisticAllowanceKey(
  params: Omit<SetOptimisticAllowanceParams, 'amount' | 'blockNumber'>,
): string {
  return `${params.chainId}-${getAddressKey(params.tokenAddress)}-${getAddressKey(params.owner)}-${getAddressKey(params.spender)}`
}
