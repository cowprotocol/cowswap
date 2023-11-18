import { getMulticallContract } from '@cowprotocol/multicall'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { useWeb3React } from '@web3-react/core'

import useSWR, { SWRResponse } from 'swr'

export function useNativeTokenBalance(customAccount?: string): SWRResponse<BigNumber | undefined> {
  const { provider } = useWeb3React()
  const { account } = useWalletInfo()

  const balanceAccount = customAccount || account

  return useSWR(['useNativeTokenBalance', balanceAccount, provider], async () => {
    if (!provider || !balanceAccount) return undefined

    const contract = getMulticallContract(provider)

    return contract.callStatic.getEthBalance(balanceAccount)
  })
}
