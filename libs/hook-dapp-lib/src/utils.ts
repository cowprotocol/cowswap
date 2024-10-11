import * as hookDappsRegistry from './hookDappsRegistry.json'
import { CowHook, HookDappBase } from './types'

// Before the hooks store the dappId wasn't included in the hook object
type StrictCowHook = Omit<CowHook, 'dappId'> & { dappId?: string }

export interface HookToDappMatch {
  dapp: HookDappBase | null
  hook: CowHook
}

export function matchHooksToDapps(hooks: StrictCowHook[], dapps: HookDappBase[]): HookToDappMatch[] {
  const dappsMap = dapps.reduce(
    (acc, dapp) => {
      acc[dapp.id] = dapp
      return acc
    },
    {} as Record<string, HookDappBase | undefined>,
  )

  return (
    hooks
      // Skip hooks before the hooks store was introduced
      .filter((hook) => !!hook.dappId)
      .map((_hook) => {
        const hook = _hook as CowHook
        const dapp = dappsMap[hook.dappId]

        return {
          hook,
          dapp: dapp || null,
        }
      })
  )
}

export function matchHooksToDappsRegistry(
  hooks: StrictCowHook[],
  additionalHookDapps: HookDappBase[] = [],
): HookToDappMatch[] {
  return matchHooksToDapps(hooks, (Object.values(hookDappsRegistry) as HookDappBase[]).concat(additionalHookDapps))
}
