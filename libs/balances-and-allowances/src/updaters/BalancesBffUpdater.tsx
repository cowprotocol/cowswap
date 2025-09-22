import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { SWRConfiguration } from 'swr'

import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'

export function BalancesBffUpdater({
  account,
  chainId,
  pendingOrdersCount,
  tokenAddresses,
  balancesSwrConfig,
}: {
  account: string | undefined
  chainId: SupportedChainId
  pendingOrdersCount?: number
  tokenAddresses: string[]
  balancesSwrConfig: SWRConfiguration
}): null {
  usePersistBalancesFromBff({
    account,
    chainId,
    balancesSwrConfig,
    pendingOrdersCount,
    tokenAddresses,
  })

  return null
}
