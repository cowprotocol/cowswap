import { AppDataInfo, buildAppDataHooks, updateHooksOnAppData } from 'modules/appData'

import { generatePermitHook } from './generatePermitHook'

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
  const { permitInfo, inputToken, provider, account, chainId, appData } = params

  if (permitInfo) {
    // permitInfo will only be set if there's enough allowance

    const permitData = await generatePermitHook({
      inputToken,
      provider,
      account,
      chainId,
      permitInfo,
    })

    const hooks = buildAppDataHooks([permitData])

    return updateHooksOnAppData(appData, hooks)
  } else {
    // Otherwise, remove hooks (if any) from appData to avoid stale data
    return updateHooksOnAppData(appData, undefined)
  }
}
