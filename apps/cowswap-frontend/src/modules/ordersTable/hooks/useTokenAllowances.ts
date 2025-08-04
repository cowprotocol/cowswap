import { useMemo } from 'react'

import { ERC_20_INTERFACE } from '@cowprotocol/abis'
import { SWR_NO_REFRESH_OPTIONS } from '@cowprotocol/common-const'
import { useMultipleContractSingleData } from '@cowprotocol/multicall'
import { useWalletInfo } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import ms from 'ms.macro'
import { SWRConfiguration } from 'swr'

import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

const MULTICALL_OPTIONS = {}

const SWR_CONFIG: SWRConfiguration = {
  ...SWR_NO_REFRESH_OPTIONS,
  refreshInterval: ms`32s`,
}

export type AllowancesState = Record<string, BigNumber | undefined>

export function useTokenAllowances(tokenAddresses: string[]): {
  state: AllowancesState | undefined
  isLoading: boolean
} {
  const { chainId, account } = useWalletInfo()

  const spender = useTradeSpenderAddress()
  const allowanceParams = useMemo(() => (account && spender ? [account, spender] : undefined), [account, spender])

  const { data, isLoading } = useMultipleContractSingleData<[BigNumber]>(
    tokenAddresses,
    ERC_20_INTERFACE,
    'allowance',
    allowanceParams,
    MULTICALL_OPTIONS,
    SWR_CONFIG,
    `${chainId}${account}`,
  )

  const state = useMemo(() => {
    if (!data) return

    const res = tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
      acc[address.toLowerCase()] = data[index]?.[0]
      return acc
    }, {})

    return res
  }, [tokenAddresses, data])

  return useMemo(() => ({ state, isLoading }), [state, isLoading])
}
