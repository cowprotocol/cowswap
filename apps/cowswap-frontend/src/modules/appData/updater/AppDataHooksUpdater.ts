import { useEffect, useRef } from 'react'

import { useFakePermitHookData } from 'modules/permit'

import { useUpdateAppDataHooks } from '../hooks'
import { buildAppDataHooks } from '../utils/buildAppDataHooks'

export function AppDataHooksUpdater(): null {
  const updateAppDataHooks = useUpdateAppDataHooks()
  const permitHookData = useFakePermitHookData()

  // To avoid dumb re-renders
  const ref = useRef(permitHookData)
  ref.current = permitHookData
  const stableRef = JSON.stringify(permitHookData)

  useEffect(() => {
    if (stableRef) {
      const hooks = buildAppDataHooks(ref.current ? [ref.current] : undefined)
      updateAppDataHooks(hooks)
    }
  }, [stableRef, updateAppDataHooks])

  return null
}
