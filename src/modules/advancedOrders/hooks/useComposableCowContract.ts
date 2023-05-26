import { ComposableCoW } from 'abis/types'
import { useWalletInfo } from 'modules/wallet'
import COMPOSABLE_COW_ABI from 'abis/ComposableCoW.json'
import { useContract } from 'legacy/hooks/useContract'
import { COMPOSABLE_COW_ADDRESS } from '../const'

export function useComposableCowContract(): ComposableCoW | null {
  const { chainId } = useWalletInfo()
  return useContract<ComposableCoW>(chainId ? COMPOSABLE_COW_ADDRESS[chainId] : undefined, COMPOSABLE_COW_ABI, true)
}
