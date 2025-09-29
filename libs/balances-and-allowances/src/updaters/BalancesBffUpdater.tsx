import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BFF_BALANCES_SWR_CONFIG } from '../constants/bff-balances-swr-config'
import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'

const BFF_CHAIN_UPDATE_DELAY = ms`2s`

export function BalancesBffUpdater({
  account,
  chainId,
  invalidateCacheTrigger,
  tokenAddresses,
  isEnabled,
}: {
  account: string | undefined
  chainId: SupportedChainId
  invalidateCacheTrigger?: number
  tokenAddresses: string[]
  isEnabled?: boolean
}): null {
  const balancesSwrConfig = useSwrConfigWithPauseForNetwork(
    chainId,
    account,
    BFF_BALANCES_SWR_CONFIG,
    BFF_CHAIN_UPDATE_DELAY,
  )

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
