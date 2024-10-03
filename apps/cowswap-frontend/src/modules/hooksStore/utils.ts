import { HookDappType } from '@cowprotocol/hook-dapp-lib'

import { CowHookDetailsSerialized, HookDapp, HookDappIframe } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}

export function findHookDappById(dapps: HookDapp[], hookDetails: CowHookDetailsSerialized): HookDapp | undefined {
  return dapps.find((i) => i.id === hookDetails.dappId)
}

export function appendDappIdToCallData(callData: string, dappId: string): string {
  return callData.endsWith(dappId) ? callData : callData + dappId
}
