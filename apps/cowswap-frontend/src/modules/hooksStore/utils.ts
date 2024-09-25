import { CowHookDetailsSerialized, HookDapp, HookDappIframe, HookDappType } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}

export function findHookDappById(dapps: HookDapp[], hookDetails: CowHookDetailsSerialized): HookDapp | undefined {
  return dapps.find((i) => i.id === hookDetails.dappId)
}
