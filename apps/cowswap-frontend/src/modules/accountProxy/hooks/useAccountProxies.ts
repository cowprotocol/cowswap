import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { ACCOUNT_PROXY_CONFIGS } from '../accountProxy.constants'
import { getCowShedHooks } from '../utils/getCowShedHooks'

import type { AccountProxyInfo } from '../accountProxy.types'

export function useAccountProxies(): AccountProxyInfo[] | null {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { isTwapEoaEnabled } = useFeatureFlags()

  return useMemo(() => {
    if (!account || !isEvmChain(chainId)) return null

    return ACCOUNT_PROXY_CONFIGS.reduce<AccountProxyInfo[]>((proxies, config) => {
      if (config.id === 'twap-account-proxy' && (!isTwapEoaEnabled || isSafeWallet)) return proxies

      const sdk = getCowShedHooks({ chainId, accountProxyConfig: config })

      proxies.push({
        ...config,
        sdk,
        account: sdk.proxyOf(account),
      })

      return proxies
    }, [])
  }, [chainId, account, isTwapEoaEnabled, isSafeWallet])
}
