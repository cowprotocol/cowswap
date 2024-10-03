import { useCallback, useMemo } from 'react'

import { CowHook, matchHooksToDapps } from '@cowprotocol/hook-dapp-lib'

import { useAllHookDapps } from './useAllHookDapps'

export function useMatchHooksToDapps() {
  const allPreHookDapps = useAllHookDapps(true)
  const allPostHookDapps = useAllHookDapps(false)

  const allHookDapps = useMemo(() => {
    return allPreHookDapps.concat(allPostHookDapps)
  }, [allPreHookDapps, allPostHookDapps])

  return useCallback(
    (hooks: CowHook[]) => {
      return matchHooksToDapps(hooks, allHookDapps)
    },
    [allHookDapps],
  )
}
