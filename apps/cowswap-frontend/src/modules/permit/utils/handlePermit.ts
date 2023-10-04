import { AppDataInfo, buildAppDataHooks, updateHooksOnAppData } from 'modules/appData'

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
  const { permitInfo, inputToken, account, appData, generatePermitHook } = params

  if (permitInfo) {
    // permitInfo will only be set if there's enough allowance

    const permitData = await generatePermitHook({
      inputToken,
      account,
      permitInfo,
    })

    if (!permitData) {
      // Not able to generate permit data, remove it from the order
      // TODO: maybe should throw instead?
      console.warn(`[handlePermit] Unable to generate permit data`)
      return updateHooksOnAppData(appData, undefined)
    }

    const hooks = buildAppDataHooks([permitData])

    return updateHooksOnAppData(appData, hooks)
  } else {
    // Otherwise, remove hooks (if any) from appData to avoid stale data
    return updateHooksOnAppData(appData, undefined)
  }
}
