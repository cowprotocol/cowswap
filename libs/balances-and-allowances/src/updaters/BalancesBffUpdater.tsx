import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { SWRConfiguration } from 'swr'

import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'

export function BalancesBffUpdater({
  account,
  chainId,
  invalidateCacheTrigger,
  tokenAddresses,
  balancesSwrConfig,
  isEnabled,
}: {
  account: string | undefined
  chainId: SupportedChainId
  invalidateCacheTrigger?: number
  tokenAddresses: string[]
  balancesSwrConfig: SWRConfiguration
  isEnabled?: boolean
}): null {
  usePersistBalancesFromBff({
    account,
    chainId,
    balancesSwrConfig,
    invalidateCacheTrigger,
    tokenAddresses,
    isEnabled,
  })

  return null
}
