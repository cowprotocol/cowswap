import { CowHookDetails, HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import { HookDapp, HookDappIframe } from './types/hooks'

// Do a safe guard assertion that receives a HookDapp and asserts is a HookDappIframe
export function isHookDappIframe(dapp: HookDapp): dapp is HookDappIframe {
  return dapp.type === HookDappType.IFRAME
}

export function findHookDappById(dapps: HookDapp[], hookDetails: CowHookDetails): HookDapp | undefined {
  return dapps.find((i) => i.id === hookDetails.hook.dappId)
}

// If walletCompatibility is not defined, the hook is compatible with any wallet type
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const isHookCompatible = (dapp: HookDapp, walletType: HookDappWalletCompatibility) =>
  !dapp.conditions?.walletCompatibility ||
  dapp.conditions.walletCompatibility.includes(
    walletType === 'EOA' ? HookDappWalletCompatibility.EOA : HookDappWalletCompatibility.SMART_CONTRACT,
  )
