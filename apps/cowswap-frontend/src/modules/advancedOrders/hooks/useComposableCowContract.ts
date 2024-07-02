import { ComposableCoW, ComposableCoWAbi } from '@cowprotocol/abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useContract } from 'common/hooks/useContract'

import { COMPOSABLE_COW_ADDRESS } from '../const'

export function useComposableCowContract(): ComposableCoW | null {
  const { chainId } = useWalletInfo()
  return useContract<ComposableCoW>(chainId ? COMPOSABLE_COW_ADDRESS[chainId] : undefined, ComposableCoWAbi, true)
}
