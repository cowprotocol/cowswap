import { HOOK_DAPP_ID_LENGTH } from './consts'
import * as hookDappsRegistry from './hookDappsRegistry.json'
import { CowHook, HookDappBase } from './types'

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
    {} as Record<string, HookDappBase>,
  )

  return hooks.map((hook) => ({
    hook,
    dapp: dappsMap[hook.callData.slice(-HOOK_DAPP_ID_LENGTH)] || null,
  }))
}

export function matchHooksToDappsRegistry(
  hooks: CowHook[],
  additionalHookDapps: HookDappBase[] = [],
): HookToDappMatch[] {
  return matchHooksToDapps(hooks, (Object.values(hookDappsRegistry) as HookDappBase[]).concat(additionalHookDapps))
}
