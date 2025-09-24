import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { BASIC_MULTICALL_SWR_CONFIG } from '../consts'

export const BFF_BALANCES_SWR_CONFIG: SWRConfiguration = {
  ...BASIC_MULTICALL_SWR_CONFIG,
  revalidateIfStale: true,
  refreshInterval: ms`8s`,
  errorRetryCount: 3,
  errorRetryInterval: ms`30s`,
  onErrorRetry: (_: unknown, __key, config, revalidate, { retryCount }) => {
    const timeout = config.errorRetryInterval * Math.pow(2, retryCount - 1)

    setTimeout(() => revalidate({ retryCount }), timeout)
  },
}
