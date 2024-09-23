import { isLocal } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PRE_BUILD, POST_BUILD } from './dapps/BuildHookApp/hook'
import { PRE_CLAIM_GNO } from './dapps/ClaimGnoHookApp/hook'
import { PERMIT_HOOK } from './dapps/PermitHookApp/hook'
import { OMNIBRIDGE_POST_HOOK } from './iframeHookDapps'
import { HookDapp } from './types/hooks'

export const PRE_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: [PRE_BUILD],
  [SupportedChainId.GNOSIS_CHAIN]: [PRE_CLAIM_GNO, PRE_BUILD],
  [SupportedChainId.SEPOLIA]: [PRE_BUILD, PERMIT_HOOK],
  [SupportedChainId.ARBITRUM_ONE]: [PRE_BUILD],
}

export const POST_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: [POST_BUILD],
  [SupportedChainId.GNOSIS_CHAIN]: [POST_BUILD],
  [SupportedChainId.SEPOLIA]: [POST_BUILD, PERMIT_HOOK],
  [SupportedChainId.ARBITRUM_ONE]: [POST_BUILD],
}

if (isLocal) {
  POST_HOOK_REGISTRY[SupportedChainId.GNOSIS_CHAIN].push(OMNIBRIDGE_POST_HOOK)
}
