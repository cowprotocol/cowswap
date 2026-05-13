import { SWRConfiguration } from 'swr'

import { BalancesQueryConfig } from './hooks/usePersistBalancesViaWebCalls'

export const BASIC_MULTICALL_SWR_CONFIG: SWRConfiguration = {
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  isPaused() {
    return !document.hasFocus()
  },
}

export const BASIC_BALANCES_QUERY_CONFIG: BalancesQueryConfig = {
  refetchInterval: 0,
}
