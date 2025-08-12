import { SWRConfiguration } from 'swr'

export const BASIC_MULTICALL_SWR_CONFIG: SWRConfiguration = {
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  isPaused() {
    return !document.hasFocus()
  },
}
