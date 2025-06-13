import { ReactElement } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HOOK_DAPP_ID_LENGTH, HookDappBase, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'

import { ERROR_MESSAGES } from './pure/AddCustomHookForm/constants'

type HookDappBaseInfo = Omit<HookDappBase, 'type' | 'conditions'>

const MANDATORY_DAPP_FIELDS: (keyof HookDappBaseInfo)[] = ['id', 'name', 'image', 'version', 'website']

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const isHex = (val: string) => Boolean(val.match(/^[0-9a-f]+$/i))

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function validateHookDappManifest(
  data: HookDappBase,
  chainId: SupportedChainId | undefined,
  isPreHook: boolean | undefined,
  isSmartContractWallet: boolean | undefined,
): ReactElement | string | null {
  const { conditions = {}, ...dapp } = data

  if (!dapp) {
    return ERROR_MESSAGES.INVALID_MANIFEST
  }

  const emptyFields = MANDATORY_DAPP_FIELDS.filter((field) => typeof dapp[field] === 'undefined')
  if (emptyFields.length > 0) {
    return ERROR_MESSAGES.MISSING_REQUIRED_FIELDS(emptyFields)
  }

  if (
    isSmartContractWallet === true &&
    typeof conditions.walletCompatibility !== 'undefined' &&
    !conditions.walletCompatibility.includes(HookDappWalletCompatibility.SMART_CONTRACT)
  ) {
    return ERROR_MESSAGES.SMART_CONTRACT_INCOMPATIBLE
  }

  if (!isHex(dapp.id) || dapp.id.length !== HOOK_DAPP_ID_LENGTH) {
    return ERROR_MESSAGES.INVALID_HOOK_ID
  }

  if (chainId && conditions.supportedNetworks && !conditions.supportedNetworks.includes(chainId)) {
    return ERROR_MESSAGES.NETWORK_COMPATIBILITY_ERROR(
      chainId,
      getChainInfo(chainId).label,
      conditions.supportedNetworks.map((id) => ({ id, label: getChainInfo(id).label })),
    )
  }

  if (conditions.position === 'post' && isPreHook === true) {
    return ERROR_MESSAGES.HOOK_POSITION_MISMATCH('post')
  }

  if (conditions.position === 'pre' && isPreHook === false) {
    return ERROR_MESSAGES.HOOK_POSITION_MISMATCH('pre')
  }

  return null
}
