import { CowHookDetails, HookDappType } from '@cowprotocol/hook-dapp-lib'

import { HookDapp, HookDappIframe } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}

export function findHookDappById(dapps: HookDapp[], hookDetails: CowHookDetails): HookDapp | undefined {
  return dapps.find((i) => i.id === hookDetails.hook.dappId)
}
