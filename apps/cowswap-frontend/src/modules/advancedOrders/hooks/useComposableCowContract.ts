import { ComposableCoW, ComposableCoWAbi } from '@cowprotocol/abis'

import { useContract, UseContractResult } from 'common/hooks/useContract'

import { COMPOSABLE_COW_ADDRESS } from '../const'

export function useComposableCowContract(): UseContractResult<ComposableCoW> {
  return useContract<ComposableCoW>(COMPOSABLE_COW_ADDRESS, ComposableCoWAbi, true)
}
