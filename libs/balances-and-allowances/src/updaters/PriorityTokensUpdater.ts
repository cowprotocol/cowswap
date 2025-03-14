import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { usePersistBalancesAndAllowances } from '../hooks/usePersistBalancesAndAllowances'
import { useSwrConfigWithPause } from '../hooks/useSwrConfigWithPause'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { refreshInterval: ms`8s` }
const ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`11s` }
const BALANCE_VALIDITY_PERIOD = ms`5s`

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps) {
  const balancesSwrConfig = useSwrConfigWithPause(props.chainId, BALANCES_SWR_CONFIG, BALANCE_VALIDITY_PERIOD)
  const allowancesSwrConfig = useSwrConfigWithPause(props.chainId, ALLOWANCES_SWR_CONFIG, BALANCE_VALIDITY_PERIOD)

  usePersistBalancesAndAllowances({
    ...props,
    balancesSwrConfig,
    allowancesSwrConfig,
  })

  return null
}
