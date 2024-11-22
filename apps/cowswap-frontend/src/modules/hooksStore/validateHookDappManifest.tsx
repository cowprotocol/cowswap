import { ReactElement } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HOOK_DAPP_ID_LENGTH, HookDappBase, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import { ERROR_MESSAGES } from './pure/AddCustomHookForm/constants'

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
        return ERROR_MESSAGES.SMART_CONTRACT_INCOMPATIBLE
      } else if (!isHex(dapp.id) || dapp.id.length !== HOOK_DAPP_ID_LENGTH) {
        return ERROR_MESSAGES.INVALID_HOOK_ID
      } else if (chainId && conditions.supportedNetworks && !conditions.supportedNetworks.includes(chainId)) {
        return (
          <p>
            <b>Network compatibility error</b>
            <br />
            <br />
            This app/hook doesn't support the current network:{' '}
            <b>
              {getChainInfo(chainId).label} (Chain ID: {chainId})
            </b>
            .
            <br />
            <br />
            Supported networks:
            <br />
            {conditions.supportedNetworks.map((id) => (
              <>
                • {getChainInfo(id).label} (Chain ID: {id})
                <br />
              </>
            ))}
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
    return ERROR_MESSAGES.INVALID_MANIFEST
  }

  return null
}
