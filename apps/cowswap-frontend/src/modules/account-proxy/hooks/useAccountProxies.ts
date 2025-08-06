import { useMemo } from 'react'

import { COW_SHED_1_0_0_VERSION, COW_SHED_LATEST_VERSION, CowShedHooks, CoWShedVersion } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

const versions: CoWShedVersion[] = [COW_SHED_LATEST_VERSION, COW_SHED_1_0_0_VERSION]

interface AccountProxyInfo {
  account: string
  version: CoWShedVersion
}

export function useAccountProxies(): AccountProxyInfo[] | null {
  const { chainId, account } = useWalletInfo()

  return useMemo(() => {
    if (!account) return null

    return versions.map((version) => {
      const sdk = new CowShedHooks(chainId, undefined, version)

      return { account: sdk.proxyOf(account), version }
    })
  }, [chainId, account])
}
