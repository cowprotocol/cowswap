import { useEffect, useMemo, useRef } from 'react'

import { PermitHookData } from '@cowprotocol/permit-utils'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useAccountAgnosticPermitHookData } from 'modules/permit'
import { useDerivedSwapInfo } from 'modules/swap/hooks/useSwapState'

import { useLimitHasEnoughAllowance } from '../../limitOrders/hooks/useLimitHasEnoughAllowance'
import { useSwapEnoughAllowance } from '../../swap/hooks/useSwapFlowContext'
import { useUpdateAppDataHooks } from '../hooks'
import { buildAppDataHooks } from '../utils/buildAppDataHooks'

function usePermitDataIfNotAllowance(): PermitHookData | undefined {
  const { target, callData, gasLimit } = useAccountAgnosticPermitHookData() || {}

  // Remove permitData if the user has enough allowance for the current trade
  const swapHasEnoughAllowance = useSwapEnoughAllowance()
  const limitHasEnoughAllowance = useLimitHasEnoughAllowance()
  const shouldUsePermit = swapHasEnoughAllowance === false || limitHasEnoughAllowance === false

  return useMemo(() => {
    if (!target || !callData || !gasLimit) {
      return undefined
    }

    return shouldUsePermit ? { target, callData, gasLimit } : undefined
  }, [shouldUsePermit, target, callData, gasLimit])
}

export function AppDataHooksUpdater(): null {
  const { v2Trade } = useDerivedSwapInfo()
  const updateAppDataHooks = useUpdateAppDataHooks()
  const permitData = usePermitDataIfNotAllowance()
  const permitDataPrev = useRef<PermitHookData | undefined>(undefined)
  const hasTradeInfo = !!v2Trade
  // This is already covered up the dependency chain, but it still slips through some times
  // Adding this additional check here to try to prevent a race condition to ever allowing this to pass through
  const isSmartContractWallet = useIsSmartContractWallet()

  useEffect(() => {
    if (
      !hasTradeInfo || // If there's no trade info, wait until we have one to update the hooks (i.e. missing quote)
      JSON.stringify(permitDataPrev.current) === JSON.stringify(permitData) // Or if the permit data has not changed
    ) {
      return undefined
    }

    const hooks = buildAppDataHooks({
      preInteractionHooks: permitData ? [permitData] : undefined,
    })

    if (!isSmartContractWallet && hooks) {
      // Update the hooks
      console.log('[AppDataHooksUpdater]: Set hooks', hooks)
      updateAppDataHooks(hooks)
      permitDataPrev.current = permitData
    } else {
      // There was a hook data, but not any more. The hook needs to be removed
      console.log('[AppDataHooksUpdater] Clear hooks')
      updateAppDataHooks(undefined)
      permitDataPrev.current = undefined
    }
  }, [updateAppDataHooks, permitData, hasTradeInfo, isSmartContractWallet])

  return null
}
