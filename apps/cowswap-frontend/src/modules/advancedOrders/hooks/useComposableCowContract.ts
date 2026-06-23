import { useMemo } from 'react'

import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { UseContractResult } from 'common/hooks/useContract'

import { COMPOSABLE_COW_ADDRESS } from '../const'

export type ComposableCowContractData = UseContractResult<typeof ComposableCoWAbi>
export function useComposableCowContractData(): ComposableCowContractData {
  const { chainId } = useWalletInfo()

  return useMemo(
    () => ({
      abi: ComposableCoWAbi,
      address: COMPOSABLE_COW_ADDRESS[chainId],
      chainId,
    }),
    [chainId],
  )
}
