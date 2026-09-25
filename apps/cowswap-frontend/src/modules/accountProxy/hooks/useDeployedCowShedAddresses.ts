import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { isEvmChain, type SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { fetchDeployedCowShedAddresses } from '../services/fetchDeployedCowShedAddresses'

export function useDeployedCowShedAddresses(
  account: string | undefined,
  chainId: SupportedChainId | undefined,
): string[] | null {
  const { data } = useSWR(
    account && chainId && isEvmChain(chainId) ? (['deployed-cow-sheds', chainId, account] as const) : null,
    ([, chain, owner]) => fetchDeployedCowShedAddresses(owner, chain),
    SWR_NO_REFRESH_OPTIONS,
  )

  return data ?? null
}
