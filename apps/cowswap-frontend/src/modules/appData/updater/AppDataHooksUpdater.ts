import { useEffect, useRef, useState } from 'react'

import { latest } from '@cowprotocol/app-data'
import { PermitHookData } from '@cowprotocol/permit-utils'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { useHooksStateWithSimulatedGas } from 'modules/hooksStore'
import { useAccountAgnosticPermitHookData } from 'modules/permit'
import { useDerivedTradeState, useHasTradeEnoughAllowance, useIsHooksTradeType, useIsSellNative } from 'modules/trade'

import { useUpdateAppDataHooks } from '../hooks'
import { TypedAppDataHooks, TypedCowHook } from '../types'
import { buildAppDataHooks } from '../utils/buildAppDataHooks'
import { cowHookToTypedCowHook } from '../utils/typedHooks'

type OrderInteractionHooks = latest.OrderInteractionHooks

function useAgnosticPermitDataIfUserHasNoAllowance(): Nullish<PermitHookData> {
  const hookData = useAccountAgnosticPermitHookData()

  // Remove permitData if the user has enough allowance for the current trade
  const hasTradeEnoughAllowance = useHasTradeEnoughAllowance()

  if (hasTradeEnoughAllowance === undefined) return undefined

  const shouldUsePermit = hasTradeEnoughAllowance === false

  return shouldUsePermit ? hookData : null
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function AppDataHooksUpdater(): null {
  const tradeState = useDerivedTradeState()
  const isHooksTradeType = useIsHooksTradeType()
  const hooksStoreState = useHooksStateWithSimulatedGas()
  const preHooks = isHooksTradeType ? hooksStoreState.preHooks : null
  const postHooks = isHooksTradeType ? hooksStoreState.postHooks : null
  const updateAppDataHooks = useUpdateAppDataHooks()
  const permitData = useAgnosticPermitDataIfUserHasNoAllowance()
  const hooksPrev = useRef<OrderInteractionHooks | undefined>(undefined)
  const hasTradeInfo = !!tradeState
  // This is already covered up the dependency chain, but it still slips through some times
  // Adding this additional check here to try to prevent a race condition to ever allowing this to pass through
  const isSmartContractWallet = useIsSmartContractWallet()
  // Remove hooks if the order is selling native. There's no need for approval
  const isNativeSell = useIsSellNative()

  const [permitHook, setPermitHook] = useState<TypedCowHook | undefined>(undefined)

  useEffect(() => {
    const preInteractionHooks = (preHooks || []).map<TypedCowHook>((hookDetails) =>
      cowHookToTypedCowHook(hookDetails.hook, 'hookStore'),
    )
    const postInteractionHooks = (postHooks || []).map<TypedCowHook>((hookDetails) =>
      cowHookToTypedCowHook(hookDetails.hook, 'hookStore'),
    )

    if (permitHook) {
      preInteractionHooks.push(permitHook)
    }

    const hooks = buildAppDataHooks<TypedCowHook[], TypedAppDataHooks>({
      preInteractionHooks,
      postInteractionHooks,
    })

    const areHooksChanged = JSON.stringify(hooksPrev.current) !== JSON.stringify(hooks)

    const shouldNotUpdateHooks =
      !hasTradeInfo || // If there's no trade info, wait until we have one to update the hooks (i.e. missing quote)
      isSmartContractWallet === undefined // We don't know what type of wallet it is, wait until it's defined

    if (shouldNotUpdateHooks && !areHooksChanged) {
      return undefined
    }

    // Hooks are not available for eth-flow orders now
    if (hooks && !isNativeSell) {
      // Update the hooks
      updateAppDataHooks(hooks)
      hooksPrev.current = hooks
    } else {
      // There was a hook data, but not anymore. The hook needs to be removed
      updateAppDataHooks(undefined)
      hooksPrev.current = undefined
    }
  }, [
    updateAppDataHooks,
    hasTradeInfo,
    isSmartContractWallet,
    isNativeSell,
    preHooks,
    postHooks,
    isHooksTradeType,
    permitHook,
  ])

  useEffect(() => {
    // Permit data is not loaded yet, wait until it's loaded
    // Permit data for sc-wallets is always undefined, so we ignore this check
    if (permitData === undefined && !isSmartContractWallet) {
      return
    }

    if (permitData && !isSmartContractWallet) {
      setPermitHook(cowHookToTypedCowHook(permitData, 'permit'))
    } else {
      setPermitHook(undefined)
    }
  }, [permitData, isSmartContractWallet])

  return null
}
