import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useExternalHookDapps } from './useExternalHookDapps'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { HookDapp } from '../types/hooks'

export function useAllHookDapps(isPreHook: boolean): HookDapp[] {
  const { chainId } = useWalletInfo()
  const externalHookDapps = useExternalHookDapps()

  return useMemo(() => {
    return (isPreHook ? PRE_HOOK_REGISTRY : POST_HOOK_REGISTRY)[chainId].concat(externalHookDapps)
  }, [externalHookDapps, chainId])
}
