import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'

import { t } from '@lingui/core/macro'

import {
  addPermitHookToHooks,
  AppDataInfo,
  filterPermitSignerPermit,
  removePermitHookFromAppData,
  replaceHooksOnAppData,
} from 'modules/appData'

import { HandlePermitParams } from '../types'

/**
 * Handle token permit
 *
 * Will request user signature if needed
 * Can use cached permit if available
 *
 * If not needed, will remove any permit info from appData
 *
 * Returns the updated appData
 */
export async function handlePermit(params: HandlePermitParams): Promise<AppDataInfo> {
  const { amount, permitInfo, inputToken, account, appData, typedHooks, generatePermitHook } = params

  if (isSupportedPermitInfo(permitInfo) && !getIsNativeToken(inputToken)) {
    // permitInfo will only be set if there's NOT enough allowance

    const permitData = await generatePermitHook({
      inputToken: { address: inputToken.address, name: inputToken.name },
      account,
      permitInfo,
      amount,
    })

    if (!permitData) {
      throw new Error(t`Unable to generate permit data`)
    }

    const hooks = addPermitHookToHooks(typedHooks, permitData)

    return replaceHooksOnAppData(appData, hooks, filterPermitSignerPermit)
  } else {
    // Otherwise, pass along exiting hooks, minus permit
    return removePermitHookFromAppData(appData, typedHooks)
  }
}
