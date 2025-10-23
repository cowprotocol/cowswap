import { SetOptimisticAllowanceParams } from './useSetOptimisticAllowance'

export function getOptimisticAllowanceKey(
  params: Omit<SetOptimisticAllowanceParams, 'amount' | 'blockNumber'>,
): string {
  return `${params.chainId}-${params.tokenAddress.toLowerCase()}-${params.owner.toLowerCase()}-${params.spender.toLowerCase()}`
}
