import { AppDataInfo, buildAppDataHooks, updateHooksOnAppData } from 'modules/appData'
import { generatePermitHook, HandlePermitParams } from 'modules/permit'

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
  const { permitInfo, hasEnoughAllowance, inputToken, provider, account, chainId, appData } = params

  if (permitInfo && !hasEnoughAllowance) {
    // If token is permittable and there's not enough allowance, get the permit hook

    // TODO: maybe we need a modal to inform the user what they need to sign?
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
