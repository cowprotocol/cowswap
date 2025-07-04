import { getMulticallContract, useMultiCallRpcProvider } from '@cowprotocol/multicall'
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
  const provider = useMultiCallRpcProvider()

  return useSWR(
    account && provider ? [account, provider, chainId, 'useNativeTokenBalance'] : null,
    async ([account, provider]) => {
      const contract = getMulticallContract(provider)

      return contract.callStatic.getEthBalance(account)
    },
    swrConfig,
  )
}
