import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR, { SWRResponse } from 'swr'

import { useCowShedHooks } from './useCowShedHooks'

export function useCurrentAccountProxyAddress(): SWRResponse<string> {
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()

  return useSWR(
    account && cowShedHooks ? [account, cowShedHooks, 'useCurrentAccountProxyAddress'] : null,
    ([account, cowShedHooks]) => {
      return cowShedHooks.proxyOf(account)
    },
  )
}
