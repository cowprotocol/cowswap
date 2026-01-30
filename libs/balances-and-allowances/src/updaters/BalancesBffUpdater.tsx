import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'

export function BalancesBffUpdater({
  account,
  chainId,
  invalidateCacheTrigger,
  tokenAddresses,
}: {
  account: string | undefined
  chainId: SupportedChainId
  invalidateCacheTrigger?: number
  tokenAddresses: string[]
}): null {
  usePersistBalancesFromBff({
    account,
    chainId,
    invalidateCacheTrigger,
    tokenAddresses,
  })
  return null
}
