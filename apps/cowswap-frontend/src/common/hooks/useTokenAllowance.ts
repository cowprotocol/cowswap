import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRResponse } from 'swr'

import { useTokenContract } from 'common/hooks/useContract'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

const SWR_OPTIONS = {
  ...SWR_NO_REFRESH_OPTIONS,
  refreshInterval: ms`10s`,
}

export function useTokenAllowance(
  token: Token | undefined,
  owner?: string,
  spender?: string,
): SWRResponse<bigint | undefined> {
  const tokenAddress = token?.address

  const { chainId, account } = useWalletInfo()
  const { contract: erc20Contract } = useTokenContract(tokenAddress)
  const tradeSpender = useTradeSpenderAddress()

  const targetOwner = owner ?? account
  const targetSpender = spender ?? tradeSpender

  return useSWR(
    erc20Contract && targetOwner && targetSpender
      ? [erc20Contract, targetOwner, targetSpender, chainId, 'useTokenAllowance']
      : null,
    ([erc20Contract, targetOwner, targetSpender]) => {
      return erc20Contract.allowance(targetOwner, targetSpender).then((result) => result.toBigInt())
    },
    SWR_OPTIONS,
  )
}
