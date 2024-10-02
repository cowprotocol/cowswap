import { ReactElement } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HOOK_DAPP_ID_LENGTH, HookDappBase, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

type HookDappBaseInfo = Omit<HookDappBase, 'type' | 'conditions'>

const MANDATORY_DAPP_FIELDS: (keyof HookDappBaseInfo)[] = ['id', 'name', 'image', 'version', 'website']

const isHex = (val: string) => Boolean(val.match(/^[0-9a-f]+$/i))

export function validateHookDappManifest(
  data: HookDappBase,
  chainId: SupportedChainId | undefined,
  isPreHook: boolean | undefined,
  isSmartContractWallet: boolean | undefined,
): ReactElement | string | null {
  const { conditions = {}, ...dapp } = data

  if (dapp) {
    const emptyFields = MANDATORY_DAPP_FIELDS.filter((field) => typeof dapp[field] === 'undefined')

    if (emptyFields.length > 0) {
      return `${emptyFields.join(',')} fields are no set.`
    } else {
      if (
        isSmartContractWallet === true &&
        conditions.walletCompatibility &&
        !conditions.walletCompatibility.includes(HookDappWalletCompatibility.SMART_CONTRACT)
      ) {
        return 'The app does not support smart-contract wallets.'
      } else if (!isHex(dapp.id) || dapp.id.length !== HOOK_DAPP_ID_LENGTH) {
        return <p>Hook dapp id must be a hex with length 64.</p>
      } else if (chainId && conditions.supportedNetworks && !conditions.supportedNetworks.includes(chainId)) {
        return <p>This app/hook doesn't support current network (chainId={chainId}).</p>
      } else if (conditions.position === 'post' && isPreHook === true) {
        return (
          <p>
            This app/hook can only be used as a <strong>post-hook</strong> and cannot be added as a pre-hook.
          </p>
        )
      } else if (conditions.position === 'pre' && isPreHook === false) {
        return (
          <p>
            This app/hook can only be used as a <strong>pre-hook</strong> and cannot be added as a post-hook.
          </p>
        )
      }
    }
  } else {
    return 'Manifest does not contain "cow_hook_dapp" property.'
  }

  return null
}
