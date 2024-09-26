import { CowHookDetailsSerialized, DappId, HookDapp, HookDappBase, HookDappIframe, HookDappType } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}

export const getHookDappId = (dapp: HookDapp): DappId => `${dapp.type}:::${dapp.name}`
export function parseDappId(id: DappId): Pick<HookDappBase, 'type' | 'name'> {
  const [type, name] = id.split(':::')

  return { type: type as HookDappType, name }
}

export function findHookDappById(dapps: HookDapp[], hookDetails: CowHookDetailsSerialized): HookDapp | undefined {
  return dapps.find((i) => {
    const { type, name } = parseDappId(hookDetails.dappId)

    return i.type === type && i.name === name
  })
}
