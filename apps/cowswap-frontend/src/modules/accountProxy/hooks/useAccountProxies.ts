import { useMemo } from 'react'

import { CowShedHooks, CoWShedVersion } from '@cowprotocol/sdk-cow-shed'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { getIsTwapEoaPrototypeEnabled } from 'entities/twap'
import { useLocation } from 'react-router'

import { getPrototypeProxyAddress } from 'modules/twap'

import { COW_SHED_VERSIONS } from '../consts'

export interface AccountProxyInfo {
  account: string
  kind: AccountProxyKind
  version?: CoWShedVersion
}

export enum AccountProxyKind {
  Standard = 'standard',
  TwapPrototype = 'twapPrototype',
}

export function useAccountProxies(): AccountProxyInfo[] | null {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { search, hash } = useLocation()

  return useMemo(() => {
    if (!account) return null

    const proxies: AccountProxyInfo[] = COW_SHED_VERSIONS.map((version) => {
      const sdk = new CowShedHooks(chainId, undefined, version)

      return { account: sdk.proxyOf(account), version, kind: AccountProxyKind.Standard }
    })

    if (getIsTwapEoaPrototypeEnabled(search, hash) && !isSafeWallet) {
      proxies.unshift({
        account: getPrototypeProxyAddress(account, chainId),
        kind: AccountProxyKind.TwapPrototype,
      })
    }

    return proxies
  }, [account, chainId, hash, isSafeWallet, search])
}
