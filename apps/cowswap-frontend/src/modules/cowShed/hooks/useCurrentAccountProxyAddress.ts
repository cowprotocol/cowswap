import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import useSWR from 'swr'

import { useCowShedHooks } from './useCowShedHooks'

interface ProxyAndAccount {
  proxyAddress: string
  account: string
  isProxyDeployed: boolean
}

export function useCurrentAccountProxyAddress(): ProxyAndAccount | undefined {
  const { account } = useWalletInfo()
  const cowShedHooks = useCowShedHooks()
  const provider = useWalletProvider()

  return useSWR(
    account && provider && cowShedHooks ? [account, provider, cowShedHooks, 'useCurrentAccountProxyAddress'] : null,
    async ([account, provider, cowShedHooks]) => {
      const proxyAddress = cowShedHooks.proxyOf(account)
      const proxyCode = await provider.getCode(proxyAddress)
      const isProxyDeployed = !!proxyCode && proxyCode !== '0x'

      return {
        proxyAddress,
        account,
        isProxyDeployed,
      }
    },
  ).data
}
