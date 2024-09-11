import { HookDapp, HookDappIframe, HookDappType } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}
