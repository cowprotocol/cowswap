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
      return `Missing required fields in manifest: ${emptyFields.join(', ')}`
    } else {
      if (
        isSmartContractWallet === true &&
        typeof conditions.walletCompatibility !== 'undefined' &&
        !conditions.walletCompatibility.includes(HookDappWalletCompatibility.SMART_CONTRACT)
      ) {
        return 'This hook is not compatible with smart contract wallets. It only supports EOA wallets.'
      } else if (!isHex(dapp.id) || dapp.id.length !== HOOK_DAPP_ID_LENGTH) {
        return 'Invalid hook dapp ID format. The ID must be a 64-character hexadecimal string.'
      } else if (chainId && conditions.supportedNetworks && !conditions.supportedNetworks.includes(chainId)) {
        return (
          <p>
            Network compatibility error:
            <br />
            This app/hook doesn't support the current network (Chain ID: {chainId}).
            <br />
            Supported networks: {conditions.supportedNetworks.join(', ')}
          </p>
        )
      } else if (conditions.position === 'post' && isPreHook === true) {
        return (
          <p>
            Hook position mismatch:
            <br />
            This app/hook can only be used as a <strong>post-hook</strong>
            <br />
            and cannot be added as a pre-hook.
          </p>
        )
      } else if (conditions.position === 'pre' && isPreHook === false) {
        return (
          <p>
            Hook position mismatch:
            <br />
            This app/hook can only be used as a <strong>pre-hook</strong>
            <br />
            and cannot be added as a post-hook.
          </p>
        )
      }
    }
  } else {
    return 'Invalid manifest format: Missing "cow_hook_dapp" property in manifest.json'
  }

  return null
}
