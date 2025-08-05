import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { usePersistBalancesAndAllowances } from '../hooks/usePersistBalancesAndAllowances'

export const PRIORITY_TOKENS_REFRESH_INTERVAL = ms`8s`

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { revalidateIfStale: false, refreshInterval: PRIORITY_TOKENS_REFRESH_INTERVAL }

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps): null {
  usePersistBalancesAndAllowances({
    ...props,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
  })

  return null
}
