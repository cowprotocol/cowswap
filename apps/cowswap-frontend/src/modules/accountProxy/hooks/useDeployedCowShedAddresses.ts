import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { type SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { programmaticOrdersApi } from 'modules/twap/services/programmaticOrdersApi'

import { isEvmProxyOwner } from '../utils/isEvmProxyOwner'

export function useDeployedCowShedAddresses(
  account: string | undefined,
  chainId: SupportedChainId | undefined,
): string[] | null {
  const { data } = useSWR(
    chainId && isEvmProxyOwner(account, chainId) ? (['deployed-cow-sheds', chainId, account] as const) : null,
    ([, chain, owner]) => programmaticOrdersApi.fetchDeployedCowShedAddresses(owner, chain),
    SWR_NO_REFRESH_OPTIONS,
  )

  return data ?? null
}
