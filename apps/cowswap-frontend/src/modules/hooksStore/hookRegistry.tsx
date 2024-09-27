import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { AIRDROP_HOOK_APP } from './dapps/AirdropHookApp/hook'
import { PRE_BUILD, POST_BUILD } from './dapps/BuildHookApp/hook'
import { PRE_CLAIM_GNO } from './dapps/ClaimGnoHookApp/hook'
import { CLAIM_VESTING_APP } from './dapps/ClaimVestingApp/hook'
import { PERMIT_HOOK } from './dapps/PermitHookApp/hook'
import { HookDapp } from './types/hooks'

export const PRE_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: [PRE_BUILD, CLAIM_VESTING_APP],
  [SupportedChainId.GNOSIS_CHAIN]: [PRE_CLAIM_GNO, PRE_BUILD, CLAIM_VESTING_APP],
  [SupportedChainId.SEPOLIA]: [PRE_BUILD, PERMIT_HOOK, AIRDROP_HOOK_APP],
  [SupportedChainId.ARBITRUM_ONE]: [PRE_BUILD, CLAIM_VESTING_APP],
}

export const POST_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: [POST_BUILD, CLAIM_VESTING_APP],
  [SupportedChainId.GNOSIS_CHAIN]: [POST_BUILD, CLAIM_VESTING_APP],
  [SupportedChainId.SEPOLIA]: [POST_BUILD, AIRDROP_HOOK_APP, PERMIT_HOOK],
  [SupportedChainId.ARBITRUM_ONE]: [POST_BUILD, CLAIM_VESTING_APP],
}
