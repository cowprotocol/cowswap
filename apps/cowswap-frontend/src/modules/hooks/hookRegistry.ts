import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { HookDapp } from './types'

const PRE_CURVE = {
  name: 'Withdraw from Curve Pools',
  description: 'Allow you to un-stake and withdraw funds from Curve',
}
const PRE_NFT = { name: 'Wrap NFT', description: 'Wrap your NFT into an ERC20' }

const PRE_MAKER = { name: 'Create Maker Vault', description: 'Borrow DAI by creating a Vault' }

const PRE_CLAIM_GNO = { name: 'Claim GNO ', description: 'Borrow DAI by creating a Vault' }

const PRE_HOOK_DAAPS_ALL = [PRE_CURVE, PRE_NFT, PRE_MAKER, PRE_CLAIM_GNO]

const POST_MAKER = {
  name: 'Re-pay Maker Vault',
  description: 'Return borrowed DAI',
}

const POST_HOOK_DAAPS_ALL = [POST_MAKER]

export const PRE_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: PRE_HOOK_DAAPS_ALL,
  [SupportedChainId.GNOSIS_CHAIN]: PRE_HOOK_DAAPS_ALL,
  [SupportedChainId.SEPOLIA]: [PRE_NFT],
}

export const POST_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: POST_HOOK_DAAPS_ALL,
  [SupportedChainId.GNOSIS_CHAIN]: POST_HOOK_DAAPS_ALL,
  [SupportedChainId.SEPOLIA]: [],
}
