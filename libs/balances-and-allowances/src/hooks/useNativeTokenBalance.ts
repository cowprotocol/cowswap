import { getRpcProvider } from '@cowprotocol/common-const'
import { getMulticallContract } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration, SWRResponse } from 'swr'

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: ms`11s`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: false,
}

export function useNativeTokenBalance(
  account: string | undefined,
  chainId: number,
  swrConfig: SWRConfiguration = SWR_CONFIG,
): SWRResponse<BigNumber> {
  const provider = getRpcProvider(chainId)

  return useSWR(
    account && provider ? ['useNativeTokenBalance', account, provider] : null,
    async ([, _account, _provider]) => {
      const contract = getMulticallContract(_provider)

      return contract.callStatic.getEthBalance(_account)
    },
    swrConfig,
  )
}
