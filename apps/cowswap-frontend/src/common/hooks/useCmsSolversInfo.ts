import { CmsSolversInfo, getSolversInfo } from '@cowprotocol/core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

const SOLVERS_INFO_SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`1hour`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

const EMPTY_VALUE: CmsSolversInfo = []

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCmsSolversInfo() {
  const { data } = useSWR<CmsSolversInfo, Error, string>('/solvers', getSolversInfo, SOLVERS_INFO_SWR_CONFIG)

  return data || EMPTY_VALUE
}
