import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { getTokenAddressKey } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'

import { balancesAtom } from '../state/balancesAtom'

export function useUpdateTokenBalance(): (tokenAddress: string, balance: BigNumber | undefined) => void {
  const setBalances = useSetAtom(balancesAtom)

  return useCallback(
    (tokenAddress: string, balance: BigNumber | undefined) => {
      setBalances((state) => ({ ...state, values: { ...state.values, [getTokenAddressKey(tokenAddress)]: balance } }))
    },
    [setBalances],
  )
}
