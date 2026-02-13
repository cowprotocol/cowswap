import { useSetAtom } from 'jotai/index'
import { useCallback } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { balancesAtom } from '../state/balancesAtom'

export function useUpdateTokenBalance(): (tokenAddress: string, balance: bigint | undefined) => void {
  const setBalances = useSetAtom(balancesAtom)

  return useCallback(
    (tokenAddress: string, balance: bigint | undefined) => {
      setBalances((state) => ({ ...state, values: { ...state.values, [getAddressKey(tokenAddress)]: balance } }))
    },
    [setBalances],
  )
}
