import { ComposableCoW, ComposableCoWAbi } from '@cowswap/abis'
import { useWalletInfo } from '@cowswap/wallet'

import { useContract } from 'legacy/hooks/useContract'

import { COMPOSABLE_COW_ADDRESS } from '../const'

export function useComposableCowContract(): ComposableCoW | null {
  const { chainId } = useWalletInfo()
  return useContract<ComposableCoW>(chainId ? COMPOSABLE_COW_ADDRESS[chainId] : undefined, ComposableCoWAbi, true)
}
