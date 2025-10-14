import { PERMIT_HOOK_DAPP_ID } from './consts'
import { hookDappsRegistry } from './hookDappsRegistry'
import { CowHook, HookDappBase } from './types'

const hookDapps = Object.keys(hookDappsRegistry).reduce((acc, id) => {
  const dapp = (hookDappsRegistry as Record<string, Omit<HookDappBase, 'id'>>)[id]

  acc.push({ id, ...dapp })
  return acc
}, [] as HookDappBase[])

// permit() function selector
const EIP_2612_PERMIT_SELECTOR = '0xd505accf'
const DAI_PERMIT_SELECTOR = '0x8fcbaf0c'

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

        /**
         * Permit token is a special case, as it's not a dapp, but a hook
         */
        if (doesHookHavePermit(hook)) {
          return {
            hook,
            dapp: hookDappsRegistry[PERMIT_HOOK_DAPP_ID] as HookDappBase,
          }
        }

        return {
          hook,
          dapp: dapp || null,
        }
      })
  )
}

export function doesHookHavePermit(hook: { callData: string }): boolean {
  return hook.callData.startsWith(EIP_2612_PERMIT_SELECTOR) || hook.callData.startsWith(DAI_PERMIT_SELECTOR)
}

export function matchHooksToDappsRegistry(
  hooks: StrictCowHook[],
  additionalHookDapps: HookDappBase[] = [],
): HookToDappMatch[] {
  return matchHooksToDapps(hooks, hookDapps.concat(additionalHookDapps))
}
