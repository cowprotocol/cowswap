import { getMulticallContract } from '@cowprotocol/multicall'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

const SWR_CONFIG = { refreshInterval: ms`11s` }

export function useNativeTokenBalance(account: string | undefined): SWRResponse<BigNumber> {
  const provider = useWalletProvider()

  return useSWR(
    account && provider ? ['useNativeTokenBalance', account, provider] : null,
    async ([, _account, _provider]) => {
      const contract = getMulticallContract(_provider)

      return contract.callStatic.getEthBalance(_account)
    },
    SWR_CONFIG
  )
}
