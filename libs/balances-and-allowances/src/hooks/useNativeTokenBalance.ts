import { getMulticallContract } from '@cowprotocol/multicall'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

const SWR_CONFIG = { refreshInterval: ms`11s` }

export function useNativeTokenBalance(account: string | undefined): SWRResponse<BigNumber | undefined> {
  const { provider } = useWeb3React()

  return useSWR(
    ['useNativeTokenBalance', account, provider],
    async () => {
      if (!provider || !account) return undefined

      const contract = getMulticallContract(provider)

      return contract.callStatic.getEthBalance(account)
    },
    SWR_CONFIG
  )
}
