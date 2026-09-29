import { FiniteMap } from '@cowprotocol/common-utils'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowShedHooks } from '@cowprotocol/sdk-cow-shed'

import { ACCOUNT_PROXY_CONFIGS, COW_SHED_LATEST_VERSION_ID } from '../accountProxy.constants'

import type { AccountProxyConfig } from '../accountProxy.types'

const cowShedHooksCache = new FiniteMap<string, CowShedHooks>(
  // So that we don't end up with ACCOUNT_PROXY_CONFIGS.length for each chain in memory:
  2 * ACCOUNT_PROXY_CONFIGS.length,
)

export interface GetCowShedHooksParams {
  chainId: SupportedChainId
  accountProxyConfig?: AccountProxyConfig
}

export function getCowShedHooks({ chainId, accountProxyConfig }: GetCowShedHooksParams): CowShedHooks {
  const cowShedHooksKey = `${chainId}-${accountProxyConfig?.id || COW_SHED_LATEST_VERSION_ID}`

  let cowShedHooksInstance = cowShedHooksCache.get(cowShedHooksKey)

  if (!cowShedHooksInstance) {
    cowShedHooksInstance = new CowShedHooks(chainId, accountProxyConfig?.factoryOptions, accountProxyConfig?.version)
    cowShedHooksCache.set(cowShedHooksKey, cowShedHooksInstance)
  }

  return cowShedHooksInstance
}
