import type { SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'

import { usePersistBalancesViaWebCalls } from '../hooks/usePersistBalancesViaWebCalls'

export const PRIORITY_TOKENS_REFRESH_INTERVAL = ms`8s`

export interface PriorityTokensUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  tokenAddresses: string[]
}

export function PriorityTokensUpdater(props: PriorityTokensUpdaterProps): null {
  usePersistBalancesViaWebCalls({
    ...props,
  })

  return null
}
