import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

const BALANCES_UPDATES_INTERVAL_WITH_BFF = ms`8s`
const BALANCES_UPDATES_INTERVAL_WITHOUT_BFF = ms`31s`

export function useEnrichSwrConfigWithRefreshIntervalForBalances(config: SWRConfiguration): SWRConfiguration {
  const { isBffBalanceApiEnabled } = useFeatureFlags()

  return useMemo(() => {
    const refreshInterval = isBffBalanceApiEnabled
      ? BALANCES_UPDATES_INTERVAL_WITH_BFF
      : BALANCES_UPDATES_INTERVAL_WITHOUT_BFF
    return { ...config, refreshInterval }
  }, [isBffBalanceApiEnabled, config])
}
