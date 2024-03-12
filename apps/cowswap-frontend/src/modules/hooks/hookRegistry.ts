import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { HookDapp } from './types'

const FAKE_URL = 'https://google.com'

const PRE_CURVE = {
  name: 'Withdraw from Curve Pools',
  description: 'Allow you to un-stake and withdraw funds from Curve',
  url: FAKE_URL,
}
const PRE_NFT = { name: 'Wrap NFT', description: 'Wrap your NFT into an ERC20', url: FAKE_URL }

const PRE_MAKER = { name: 'Create Maker Vault', description: 'Borrow DAI by creating a Vault', url: FAKE_URL }

const PRE_CLAIM_GNO = { name: 'Claim GNO ', description: 'Borrow DAI by creating a Vault', url: FAKE_URL }

// const PRE_TEST = {
//   name: 'Claim GNO ',
//   description:
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac pretium nibh. Nam vel nunc vel risus consectetur consectetur. Nam ut sagittis erat, id lacinia mauris. Fusce ultrices condimentum sem in luctus. Sed sit amet libero eu diam vehicula pellentesque vitae in ipsum. Nulla consectetur justo a pellentesque tincidunt. Pellentesque dui orci, elementum fermentum placerat vel, vestibulum et magna. Vivamus egestas nibh id velit facilisis, ultrices iaculis magna dignissim. Aenean et dictum sapien. Integer sapien nisi, varius eu consequat consectetur, suscipit nec lectus. Sed massa ante, mattis ut nibh in, imperdiet dapibus arcu. Etiam sed pharetra velit, et viverra nunc. Proin tristique mauris dui, sit amet imperdiet erat dignissim eu. Nulla facilisi. Aenean a condimentum ex. Quisque turpis mauris, laoreet non nulla et, vulputate placerat dolor. Vivamus ante tellus, euismod sed pellentesque ut, bibendum vel lectus. Sed sed nisl in nisi cursus bibendum. Mauris non mauris et ligula sollicitudin molestie condimentum vel quam.',
//   url: FAKE_URL,
// }

const PRE_HOOK_DAAPS_ALL = [PRE_CURVE, PRE_NFT, PRE_MAKER, PRE_CLAIM_GNO]

const POST_BRIDGE = {
  name: 'Bridge Tokens',
  description: 'Bridge tokes to another layer',
  url: FAKE_URL,
}

const POST_MAKER = {
  name: 'Re-pay Maker Vault',
  description: 'Return borrowed DAI',
  url: FAKE_URL,
}

const POST_HOOK_DAAPS_ALL = [POST_BRIDGE, POST_MAKER]

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
