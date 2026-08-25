import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BASIC_BALANCES_QUERY_CONFIG } from '../consts'
import { usePersistBalancesViaWebCalls } from '../hooks/usePersistBalancesViaWebCalls'

export const PRIORITY_TOKENS_REFRESH_INTERVAL = ms`8s`

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_QUERY_CONFIG = { ...BASIC_BALANCES_QUERY_CONFIG, refetchInterval: PRIORITY_TOKENS_REFRESH_INTERVAL }

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps): null {
  usePersistBalancesViaWebCalls({
    ...props,
    balancesQueryConfig: BALANCES_QUERY_CONFIG,
  })

  return null
}
