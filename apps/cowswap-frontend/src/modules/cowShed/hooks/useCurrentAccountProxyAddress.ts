import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useCowShedHooks } from './useCowShedHooks'

interface ProxyAndAccount {
  proxyAddress: string
  account: string
}

export function useCurrentAccountProxyAddress(): ProxyAndAccount | undefined {
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()

  return useSWR(
    account && cowShedHooks ? [account, cowShedHooks, 'useCurrentAccountProxyAddress'] : null,
    ([account, cowShedHooks]) => {
      const proxyAddress = cowShedHooks.proxyOf(account)

      return {
        proxyAddress,
        account,
      }
    },
  ).data
}
