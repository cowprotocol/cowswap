import { Erc20 } from '@cowprotocol/abis'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useWeb3React } from '@web3-react/core'

import useSWR, { SWRResponse } from 'swr'

import { erc20Interface } from '../const'

export function useTokenBalanceForAccount(
  token: TokenWithLogo | undefined,
  account: string | undefined
): SWRResponse<BigNumber | undefined> {
  const { provider } = useWeb3React()

  return useSWR<BigNumber | undefined>(['useTokenBalanceForAccount', token, account], async () => {
    if (!provider || !account || !token) return undefined

    const tokenContract = new Contract(token.address, erc20Interface, provider) as Erc20

    return tokenContract.balanceOf(account)
  })
}
