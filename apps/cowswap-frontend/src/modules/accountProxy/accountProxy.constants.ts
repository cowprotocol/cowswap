import {
  COW_SHED_1_0_0_VERSION,
  COW_SHED_LATEST_VERSION,
  type CoWShedVersion,
  type ICoWShedOptions,
} from '@cowprotocol/sdk-cow-shed'

import { msg } from '@lingui/core/macro'

import type { AccountProxyConfig } from './accountProxy.types'

export const COW_SHED_VERSIONS: CoWShedVersion[] = [COW_SHED_LATEST_VERSION, COW_SHED_1_0_0_VERSION]

export const COW_SHED_LATEST_VERSION_ID = `version-${COW_SHED_LATEST_VERSION}` as const

/**
 * ComposableCoW-enabled cow-shed (`COWShedForComposableCoW` + factory).
 *
 * Used by EOA TWAP so the shed can own ComposableCoW conditional orders.
 *
 * Addresses match multi-chain CREATE2 deploys in cow-shed `networks.json`
 * (`COWShedFactoryForComposableCoW` / `COWShedForComposableCoW`) — including
 * Mainnet, Gnosis, and Sepolia.
 *
 * @see https://github.com/cowdao-grants/cow-shed/blob/main/networks.json — deployment registry
 * @see https://github.com/cowdao-grants/cow-shed/pull/68 — first multi-chain `COWShedFactoryForComposableCoW` entries
 * @see https://github.com/cowdao-grants/cow-shed/commit/f3221e448c61753cebf2e8f5168ca73295e064ff — #68 merge
 * @see https://github.com/cowdao-grants/cow-shed/pull/53 — ComposableCoW-enabled shed (contract feature)
 *
 * EIP-712 `version` must match on-chain `COWShed.VERSION` (`"2.1.0"` in current cow-shed main).
 */
export const EOA_TWAP_SHED_EIP712_VERSION = '2.1.0' as CoWShedVersion

export const EOA_TWAP_SHED_FACTORY_OPTIONS: ICoWShedOptions = {
  // networks.json → COWShedFactoryForComposableCoW / COWShedForComposableCoW (same CREATE2 addr on all listed chains)
  factoryAddress: '0x5E284e80F3bd6A7D80A8500D9c49878028110848',
  implementationAddress: '0xF0D400089d5b9fACA64E3422AD6614546587cfFB',
  proxyCreationCode:
    '0x60a03461009557601f61033d38819003918201601f19168301916001600160401b0383118484101761009957808492604094855283398101031261009557610052602061004b836100ad565b92016100ad565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc5560405161027b90816100c28239608051818181608b01526101750152f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036100955756fe60806040526004361015610018575b3661019757610197565b5f3560e01c8063025b22bc146100375763f851a4400361000e57610116565b346101125760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc3601126101125760043573ffffffffffffffffffffffffffffffffffffffff81169081810361011257337f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff160361010d577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b5f80a2005b61023d565b5f80fd5b34610112575f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261011257602061014e61016c565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b33300361010d577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101f0575b1561023d577ff92ee8a9000000000000000000000000000000000000000000000000000000005f5260045ffd5b507fc4d66de8000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000005f351614156101c3565b5f807f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc54368280378136915af43d5f803e15610277573d5ff35b3d5ffd',
}

export const EOA_TWAP_ACCOUNT_PROXY_CONFIG: AccountProxyConfig = {
  id: 'twap-account-proxy',
  label: msg`TWAP Account Proxy`,
  version: EOA_TWAP_SHED_EIP712_VERSION,
  factoryOptions: EOA_TWAP_SHED_FACTORY_OPTIONS,
}

export const ACCOUNT_PROXY_CONFIGS = [
  {
    id: COW_SHED_LATEST_VERSION_ID,
    version: COW_SHED_LATEST_VERSION,
  },
  {
    id: `version-${COW_SHED_1_0_0_VERSION}`,
    version: COW_SHED_1_0_0_VERSION,
  },
  EOA_TWAP_ACCOUNT_PROXY_CONFIG,
] as const satisfies AccountProxyConfig[]

export const NEED_HELP_LABEL = msg`Need help`
