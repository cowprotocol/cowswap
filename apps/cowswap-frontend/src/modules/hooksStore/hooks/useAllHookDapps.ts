import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useCustomHookDapps } from './useCustomHookDapps'

import { POST_HOOK_REGISTRY, PRE_HOOK_REGISTRY } from '../hookRegistry'
import { HookDapp } from '../types/hooks'

export function useAllHookDapps(isPreHook: boolean): HookDapp[] {
  const { chainId } = useWalletInfo()
  const customHookDapps = useCustomHookDapps()

  return useMemo(() => {
    return (isPreHook ? PRE_HOOK_REGISTRY : POST_HOOK_REGISTRY)[chainId].concat(customHookDapps)
  }, [customHookDapps, chainId])
}
