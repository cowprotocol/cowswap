import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ALL_HOOK_DAPPS } from '../hookRegistry'
import { HookDapp } from '../types/hooks'

export function useInternalHookDapps(isPreHook: boolean): HookDapp[] {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    return ALL_HOOK_DAPPS.filter((dapp) => {
      const position = dapp?.conditions?.position
      const supportedNetworks = dapp?.conditions?.supportedNetworks

      if (supportedNetworks && !supportedNetworks.includes(chainId)) return false

      if (position) {
        if (isPreHook && position !== 'pre') return false
        if (!isPreHook && position !== 'post') return false
      }

      return true
    })
  }, [chainId, isPreHook])
}
