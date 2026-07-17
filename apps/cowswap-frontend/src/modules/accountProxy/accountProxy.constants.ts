import { COW_SHED_1_0_0_VERSION, COW_SHED_LATEST_VERSION, type CoWShedVersion } from '@cowprotocol/sdk-cow-shed'

import { msg } from '@lingui/core/macro'

import { EOA_TWAP_SHED_FACTORY_OPTIONS } from 'modules/cowShed'

import type { AccountProxyConfig } from './accountProxy.types'

export const COW_SHED_VERSIONS: CoWShedVersion[] = [COW_SHED_LATEST_VERSION, COW_SHED_1_0_0_VERSION]

export const COW_SHED_LATEST_VERSION_ID = `version-${COW_SHED_LATEST_VERSION}` as const

export const ACCOUNT_PROXY_CONFIGS = [
  {
    id: COW_SHED_LATEST_VERSION_ID,
    version: COW_SHED_LATEST_VERSION,
  },
  {
    id: `version-${COW_SHED_1_0_0_VERSION}`,
    version: COW_SHED_1_0_0_VERSION,
  },
  {
    id: 'eoa-twap',
    label: 'EOA TWAP',
    factoryOptions: EOA_TWAP_SHED_FACTORY_OPTIONS,
  },
] as const satisfies AccountProxyConfig[]

export const NEED_HELP_LABEL = msg`Need help`
