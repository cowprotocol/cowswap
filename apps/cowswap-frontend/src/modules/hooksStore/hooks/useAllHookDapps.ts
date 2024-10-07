import { useMemo } from 'react'

import { useCustomHookDapps } from './useCustomHookDapps'
import { useInternalHookDapps } from './useInternalHookDapps'

import { HookDapp } from '../types/hooks'

export function useAllHookDapps(isPreHook: boolean): HookDapp[] {
  const internalHookDapps = useInternalHookDapps(isPreHook)
  const customHookDapps = useCustomHookDapps(isPreHook)

  return useMemo(() => {
    return internalHookDapps.concat(customHookDapps)
  }, [customHookDapps, internalHookDapps])
}
