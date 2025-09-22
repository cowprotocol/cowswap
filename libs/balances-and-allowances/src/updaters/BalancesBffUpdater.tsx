import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'

const BALANCES_SWR_CONFIG = { ...BASIC_MULTICALL_SWR_CONFIG, revalidateIfStale: true, refreshInterval: ms`8s` }

export function BalancesBffUpdater({
  account,
  chainId,
  pendingOrdersCount,
  tokenAddresses,
}: {
  account: string | undefined
  chainId: SupportedChainId
  pendingOrdersCount?: number
  tokenAddresses: string[]
}): null {
  usePersistBalancesFromBff({
    account,
    chainId,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
    pendingOrdersCount,
    tokenAddresses,
  })

  return null
}
