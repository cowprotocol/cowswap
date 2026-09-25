import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { areAddressesEqual, isEvmChain } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useDeployedCowShedAddresses } from './useDeployedCowShedAddresses'

import { ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG, ACCOUNT_PROXY_CONFIGS } from '../accountProxy.constants'
import { getCowShedHooks } from '../utils/getCowShedHooks'

import type { AccountProxyInfo } from '../accountProxy.types'

export function useAccountProxies(): AccountProxyInfo[] | null {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const deployedAddresses = useDeployedCowShedAddresses(account, isEvmChain(chainId) ? chainId : undefined)

  return useMemo(() => {
    if (!account || !isEvmChain(chainId)) return null

    return ACCOUNT_PROXY_CONFIGS.reduce<AccountProxyInfo[]>((proxies, config) => {
      if (config.id === ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG.id && (!isTwapEoaEnabled || isSafeWallet)) {
        return proxies
      }

      const sdk = getCowShedHooks({ chainId, accountProxyConfig: config })
      const proxyAccount = sdk.proxyOf(account)
      const isDeployed = deployedAddresses?.some((address) => areAddressesEqual(address, proxyAccount)) ?? false

      if (!config.alwaysShow && !isDeployed) return proxies

      proxies.push({
        ...config,
        sdk,
        account: proxyAccount,
      })

      return proxies
    }, [])
  }, [chainId, account, deployedAddresses, isTwapEoaEnabled, isSafeWallet])
}
