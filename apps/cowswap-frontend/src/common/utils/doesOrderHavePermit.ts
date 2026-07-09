/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { doesHookHavePermit } from '@cowprotocol/hook-dapp-lib'

import { getAppDataHooks } from 'modules/appData'

import { GenericOrder } from 'common/types'

import type { Hex } from 'viem'

export function doesOrderHavePermit(order: GenericOrder): boolean {
  return !!getOrderPermitIfExists(order)
}

export function getOrderPermitIfExists(order: GenericOrder): Hex | null {
  const appData = order.fullAppData
  const hooks = getAppDataHooks(appData)
  if (!hooks?.pre) return null

  return (hooks.pre.filter((hook) => doesHookHavePermit(hook))?.[0]?.callData as Hex) || null
}
