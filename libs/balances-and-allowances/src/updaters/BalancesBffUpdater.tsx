import { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { usePersistBalancesFromBff } from '../hooks/usePersistBalancesFromBff'

export const TOKENS_REFRESH_INTERVAL = ms`8s`

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: TOKENS_REFRESH_INTERVAL }

export function BalancesBffUpdater({
  account,
  chainId,
}: {
  account: string | undefined
  chainId: SupportedChainId
}): null {
  usePersistBalancesFromBff({
    account,
    chainId,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
  })

  return null
}
