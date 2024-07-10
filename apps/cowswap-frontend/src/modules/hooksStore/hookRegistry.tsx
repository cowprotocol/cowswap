import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HookDapp, HookDappIframe, HookDappType } from '@cowprotocol/types'

import { PRE_BUILD } from './dapps/BuildHookApp'
import { PRE_CLAIM_GNO } from './dapps/ClaimGnoHookApp'
import bridgeImg from './images/bridge.svg'
import buildImg from './images/build.png'
import cowAMM from './images/cowAMM.png'
import curveImg from './images/curve.svg'
import daiImg from './images/dai.svg'

const FAKE_URL = 'https://google.com'

const FAKE_VERSION = 'v1.0.0'
// const FAKE_IMAGE = 'https://swap.cow.fi/images/og-meta-cowswap.png?v=2'

const PRE_CURVE: HookDappIframe = {
  name: 'Withdraw from Curve Pools',
  description: 'Allow you to un-stake and withdraw funds from Curve',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: curveImg,
  version: FAKE_VERSION,
}
// const PRE_NFT: HookDappIframe = {
//   name: 'Wrap NFT',
//   description: 'Wrap your NFT into an ERC20',
//   type: HookDappType.IFRAME,
//   url: FAKE_URL,
//   image: FAKE_IMAGE,
//   version: FAKE_VERSION,
// }

const PRE_COWAMM: HookDappIframe = {
  name: 'Cow AM: Remove liquidity',
  description: 'Remove liquidity from your pool',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: cowAMM,
  version: FAKE_VERSION,
}

const PRE_MAKER: HookDappIframe = {
  name: 'Create Maker Vault',
  description: 'Borrow DAI by creating a Vault',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: daiImg,
  version: FAKE_VERSION,
}

// const PRE_TEST = {
//   name: 'Claim GNO ',
//   description:
//     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac pretium nibh. Nam vel nunc vel risus consectetur consectetur. Nam ut sagittis erat, id lacinia mauris. Fusce ultrices condimentum sem in luctus. Sed sit amet libero eu diam vehicula pellentesque vitae in ipsum. Nulla consectetur justo a pellentesque tincidunt. Pellentesque dui orci, elementum fermentum placerat vel, vestibulum et magna. Vivamus egestas nibh id velit facilisis, ultrices iaculis magna dignissim. Aenean et dictum sapien. Integer sapien nisi, varius eu consequat consectetur, suscipit nec lectus. Sed massa ante, mattis ut nibh in, imperdiet dapibus arcu. Etiam sed pharetra velit, et viverra nunc. Proin tristique mauris dui, sit amet imperdiet erat dignissim eu. Nulla facilisi. Aenean a condimentum ex. Quisque turpis mauris, laoreet non nulla et, vulputate placerat dolor. Vivamus ante tellus, euismod sed pellentesque ut, bibendum vel lectus. Sed sed nisl in nisi cursus bibendum. Mauris non mauris et ligula sollicitudin molestie condimentum vel quam.',
//   url: FAKE_URL,
// }

const POST_BRIDGE: HookDappIframe = {
  name: 'Bridge Tokens',
  description: 'Bridge tokes to another layer',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: bridgeImg,
  version: FAKE_VERSION,
}

const POST_MAKER: HookDappIframe = {
  name: 'Re-pay Maker Vault',
  description: 'Return borrowed DAI',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: daiImg,
  version: FAKE_VERSION,
}

const POST_BUILD: HookDappIframe = {
  name: 'Build your own Post-hook',
  description: 'Add an arbitrary calldata to be executed after your hook',
  type: HookDappType.IFRAME,
  url: FAKE_URL,
  image: buildImg,
  version: FAKE_VERSION,
}

const POST_HOOK_DAPPS_ALL = [POST_BRIDGE, POST_MAKER, POST_BUILD]

export const PRE_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: [PRE_CURVE, PRE_COWAMM, PRE_MAKER, PRE_BUILD],
  [SupportedChainId.GNOSIS_CHAIN]: [PRE_CLAIM_GNO, PRE_CURVE, PRE_COWAMM, PRE_MAKER, PRE_BUILD],
  [SupportedChainId.SEPOLIA]: [PRE_COWAMM, PRE_BUILD],
  [SupportedChainId.ARBITRUM_ONE]: [PRE_COWAMM, PRE_BUILD],
}

export const POST_HOOK_REGISTRY: Record<SupportedChainId, HookDapp[]> = {
  [SupportedChainId.MAINNET]: POST_HOOK_DAPPS_ALL,
  [SupportedChainId.GNOSIS_CHAIN]: POST_HOOK_DAPPS_ALL,
  [SupportedChainId.SEPOLIA]: [],
  [SupportedChainId.ARBITRUM_ONE]: [],
}
