import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'
import { usePersistBalancesViaWebCalls } from '../hooks/usePersistBalancesViaWebCalls'

export const PRIORITY_TOKENS_REFRESH_INTERVAL = ms`8s`

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { ...BASIC_MULTICALL_SWR_CONFIG, refreshInterval: PRIORITY_TOKENS_REFRESH_INTERVAL }

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps): null {
  usePersistBalancesViaWebCalls({
    ...props,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
  })

  return null
}
