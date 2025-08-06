import { useMemo } from 'react'

import { CowShedHooks, CoWShedVersion } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { COW_SHED_VERSIONS } from '../consts'

interface AccountProxyInfo {
  account: string
  version: CoWShedVersion
}

export function useAccountProxies(): AccountProxyInfo[] | null {
  const { chainId, account } = useWalletInfo()

  return useMemo(() => {
    if (!account) return null

    return COW_SHED_VERSIONS.map((version) => {
      const sdk = new CowShedHooks(chainId, undefined, version)

      return { account: sdk.proxyOf(account), version }
    })
  }, [chainId, account])
}
