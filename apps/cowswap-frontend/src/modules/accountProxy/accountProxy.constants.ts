import {
  COW_SHED_1_0_0_VERSION,
  COW_SHED_1_0_1_VERSION,
  COW_SHED_2_1_0_VERSION,
  COW_SHED_FACTORY_FOR_COMPOSABLE_COW,
  COW_SHED_IMPLEMENTATION_FOR_COMPOSABLE_COW,
  COW_SHED_PROXY_INIT_CODE,
  type CoWShedVersion,
} from '@cowprotocol/sdk-cow-shed'

import { msg } from '@lingui/core/macro'

import type { AccountProxyConfig } from './accountProxy.types'

/** Unique shed versions, newest first. The live hooks shed is regular 2.1.0. */
export const COW_SHED_VERSIONS: CoWShedVersion[] = [
  COW_SHED_2_1_0_VERSION,
  COW_SHED_1_0_1_VERSION,
  COW_SHED_1_0_0_VERSION,
]

export const COW_SHED_LATEST_VERSION_ID = `version-${COW_SHED_2_1_0_VERSION}` as const

/**
 * Hide sheds the programmatic-orders indexer has not returned.
 * Off: that indexer misses sheds that were deployed and used, including 1.0.0 hook proxies.
 */
export const SHOW_ONLY_DEPLOYED_ACCOUNT_PROXIES = false

/**
 * ComposableCoW-enabled cow-shed (`COWShedForComposableCoW` + factory).
 *
 * Same EIP-712 version as the regular 2.1.0 shed, but a different factory and implementation
 * so the proxy can own ComposableCoW conditional orders.
 */
export const ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG = {
  id: 'advanced-orders-account-proxy',
  version: COW_SHED_2_1_0_VERSION,
  alwaysShow: true,
  label: msg`Advanced Orders`,
  factoryOptions: {
    factoryAddress: COW_SHED_FACTORY_FOR_COMPOSABLE_COW[COW_SHED_2_1_0_VERSION],
    implementationAddress: COW_SHED_IMPLEMENTATION_FOR_COMPOSABLE_COW[COW_SHED_2_1_0_VERSION],
    proxyCreationCode: COW_SHED_PROXY_INIT_CODE[COW_SHED_2_1_0_VERSION],
  },
} as const satisfies AccountProxyConfig

export const ACCOUNT_PROXY_CONFIGS = [
  ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG,
  {
    id: COW_SHED_LATEST_VERSION_ID,
    version: COW_SHED_2_1_0_VERSION,
    alwaysShow: true,
  },
  {
    id: `version-${COW_SHED_1_0_1_VERSION}`,
    version: COW_SHED_1_0_1_VERSION,
  },
  {
    id: `version-${COW_SHED_1_0_0_VERSION}`,
    version: COW_SHED_1_0_0_VERSION,
  },
] as const satisfies AccountProxyConfig[]

export const NEED_HELP_LABEL = msg`Need help`
