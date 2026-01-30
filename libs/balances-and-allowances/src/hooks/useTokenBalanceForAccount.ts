import { TokenWithLogo } from '@cowprotocol/common-const'
import { Erc20, ERC_20_INTERFACE } from '@cowprotocol/cowswap-abis'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'

import useSWR, { SWRResponse } from 'swr'

export function useTokenBalanceForAccount(
  token: TokenWithLogo | undefined,
  account: string | undefined,
): SWRResponse<BigNumber | undefined> {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const provider = useWalletProvider()

  return useSWR<BigNumber | undefined>(['useTokenBalanceForAccount', token, account], async () => {
    if (!provider || !account || !token) return undefined

    const tokenContract = new Contract(token.address, ERC_20_INTERFACE, provider) as Erc20

    return tokenContract.balanceOf(account)
  })
}
