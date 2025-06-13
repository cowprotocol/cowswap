import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { usePersistBalancesAndAllowances } from '../hooks/usePersistBalancesAndAllowances'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const BALANCES_SWR_CONFIG = { refreshInterval: ms`8s` }
const ALLOWANCES_SWR_CONFIG = { refreshInterval: ms`11s` }

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps) {
  usePersistBalancesAndAllowances({
    ...props,
    balancesSwrConfig: BALANCES_SWR_CONFIG,
    allowancesSwrConfig: ALLOWANCES_SWR_CONFIG,
  })

  return null
}
