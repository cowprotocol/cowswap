import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ALL_HOOK_DAPPS } from '../hookRegistry'
import { HookDapp } from '../types/hooks'

export function useInternalHookDapps(isPreHook: boolean): HookDapp[] {
  const { chainId } = useWalletInfo()

  return useMemo(() => {
    return ALL_HOOK_DAPPS.filter((dapp) => {
      if (dapp?.conditions?.supportedNetworks && !dapp.conditions.supportedNetworks.includes(chainId)) return false

      if (isPreHook && dapp?.conditions?.position && dapp.conditions.position !== 'pre') return false

      return true
    })
  }, [chainId])
}
