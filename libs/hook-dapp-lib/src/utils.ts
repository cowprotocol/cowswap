import * as hookDappsRegistry from './hookDappsRegistry.json'
import { CowHook, HookDappBase } from './types'

const hookDapps = Object.keys(hookDappsRegistry).reduce((acc, id) => {
  const dapp = (hookDappsRegistry as Record<string, Omit<HookDappBase, 'id'>>)[id]

  acc.push({ id, ...dapp })
  return acc
}, [] as HookDappBase[])

// permit() function selector
const EIP_2612_PERMIT_SELECTOR = '0xd505accf'
// TODO: remove it after 01.01.2025
const DAI_PERMIT_SELECTOR = '0x8fcbaf0c'
const PERMIT_DAPP_ID = '1db4bacb661a90fb6b475fd5b585acba9745bc373573c65ecc3e8f5bfd5dee1f'

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
        if (
          (!dapp || hook.dappId === PERMIT_DAPP_ID) &&
          (hook.callData.startsWith(EIP_2612_PERMIT_SELECTOR) || hook.callData.startsWith(DAI_PERMIT_SELECTOR))
        ) {
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
  )
}

export function matchHooksToDappsRegistry(
  hooks: StrictCowHook[],
  additionalHookDapps: HookDappBase[] = [],
): HookToDappMatch[] {
  return matchHooksToDapps(hooks, hookDapps.concat(additionalHookDapps))
}
