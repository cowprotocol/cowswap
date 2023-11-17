import { useEffect, useRef } from 'react'

import { useAccountAgnosticPermitHookData } from 'modules/permit'

import { useLimitHasEnoughAllowance } from '../../limitOrders/hooks/useTradeFlowContext'
import { useSwapEnoughAllowance } from '../../swap/hooks/useSwapFlowContext'
import { useUpdateAppDataHooks } from '../hooks'
import { buildAppDataHooks } from '../utils/buildAppDataHooks'

export function AppDataHooksUpdater(): null {
  const updateAppDataHooks = useUpdateAppDataHooks()
  const permitHookData = useAccountAgnosticPermitHookData()
  // load connected account
  const swapHasEnoughAllowance = useSwapEnoughAllowance()
  const limitHasEnoughAllowance = useLimitHasEnoughAllowance()

  const shouldUsePermit = !swapHasEnoughAllowance && !limitHasEnoughAllowance
  const permitData = shouldUsePermit ? permitHookData : undefined

  // To avoid dumb re-renders
  const ref = useRef(permitData)
  ref.current = permitData
  const stableRef = JSON.stringify(permitData)

  useEffect(() => {
    if (stableRef) {
      const hooks = buildAppDataHooks(ref.current ? [ref.current] : undefined)
      updateAppDataHooks(hooks)
    }
  }, [stableRef, updateAppDataHooks])

  return null
}
