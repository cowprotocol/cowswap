import { useEffect, useMemo, useRef } from 'react'

import { latest } from '@cowprotocol/app-data'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { PermitHookData } from '@cowprotocol/permit-utils'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useHooks } from 'modules/hooksStore'
import { useAccountAgnosticPermitHookData } from 'modules/permit'
import { useDerivedSwapInfo } from 'modules/swap/hooks/useSwapState'

import { useLimitHasEnoughAllowance } from '../../limitOrders/hooks/useLimitHasEnoughAllowance'
import { useSwapEnoughAllowance } from '../../swap/hooks/useSwapFlowContext'
import { useUpdateAppDataHooks } from '../hooks'
import { TypedAppDataHooks, TypedCowHook } from '../types'
import { buildAppDataHooks } from '../utils/buildAppDataHooks'
import { cowHookToTypedCowHook } from '../utils/typedHooks'

type OrderInteractionHooks = latest.OrderInteractionHooks

function useAgnosticPermitDataIfUserHasNoAllowance(): PermitHookData | undefined {
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
  const { trade } = useDerivedSwapInfo()
  const { preHooks, postHooks } = useHooks()
  const updateAppDataHooks = useUpdateAppDataHooks()
  const permitData = useAgnosticPermitDataIfUserHasNoAllowance()
  const hooksPrev = useRef<OrderInteractionHooks | undefined>(undefined)
  const hasTradeInfo = !!trade
  // This is already covered up the dependency chain, but it still slips through some times
  // Adding this additional check here to try to prevent a race condition to ever allowing this to pass through
  const isSmartContractWallet = useIsSmartContractWallet()
  // Remove hooks if the order is selling native. There's no need for approval
  const isNativeSell = trade?.inputAmount.currency ? getIsNativeToken(trade?.inputAmount.currency) : false

  useEffect(() => {
    const preInteractionHooks = preHooks.map<TypedCowHook>((hookDetails) =>
      cowHookToTypedCowHook(hookDetails.hook, 'hookStore')
    )
    const postInteractionHooks = postHooks.map<TypedCowHook>((hookDetails) =>
      cowHookToTypedCowHook(hookDetails.hook, 'hookStore')
    )
    const hooks = buildAppDataHooks<TypedCowHook[], TypedAppDataHooks>({
      preInteractionHooks: permitData
        ? preInteractionHooks.concat([cowHookToTypedCowHook(permitData, 'permit')])
        : preInteractionHooks,
      postInteractionHooks,
    })

    if (
      !hasTradeInfo || // If there's no trade info, wait until we have one to update the hooks (i.e. missing quote)
      isSmartContractWallet === undefined || // We don't know what type of wallet it is, wait until it's defined
      JSON.stringify(hooksPrev.current) === JSON.stringify(hooks) // Or if the hooks has not changed
    ) {
      return undefined
    }

    if (!isSmartContractWallet && !isNativeSell && hooks) {
      // Update the hooks
      updateAppDataHooks(hooks)
      hooksPrev.current = hooks
    } else {
      // There was a hook data, but not anymore. The hook needs to be removed
      updateAppDataHooks(undefined)
      hooksPrev.current = undefined
    }
  }, [updateAppDataHooks, permitData, hasTradeInfo, isSmartContractWallet, isNativeSell, preHooks, postHooks])

  return null
}
