import { HOOK_DAPP_ID_LENGTH } from './consts'
import * as hookDappsRegistry from './hookDappsRegistry.json'
import { CowHook, HookDappBase } from './types'

// permit() function selector
const PERMIT_SELECTOR = '0xd505accf'

export interface HookToDappMatch {
  dapp: HookDappBase | null
  hook: CowHook
}

export function matchHooksToDapps(hooks: CowHook[], dapps: HookDappBase[]): HookToDappMatch[] {
  const dappsMap = dapps.reduce(
    (acc, dapp) => {
      acc[dapp.id] = dapp
      return acc
    },
    {} as Record<string, HookDappBase | undefined>,
  )

  return hooks.map((hook) => {
    const dapp = dappsMap[hook.callData.slice(-HOOK_DAPP_ID_LENGTH)]

    /**
     * Permit token is a special case, as it's not a dapp, but a hook
     */
    if (!dapp && hook.callData.startsWith(PERMIT_SELECTOR)) {
      return {
        hook,
        dapp: hookDappsRegistry.PERMIT_TOKEN as HookDappBase,
      }
    }

    return {
      hook,
      dapp: dapp || null,
    }
  })
}

export function matchHooksToDappsRegistry(
  hooks: CowHook[],
  additionalHookDapps: HookDappBase[] = [],
): HookToDappMatch[] {
  return matchHooksToDapps(hooks, (Object.values(hookDappsRegistry) as HookDappBase[]).concat(additionalHookDapps))
}
