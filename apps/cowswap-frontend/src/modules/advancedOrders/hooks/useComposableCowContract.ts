import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ContractData, UseContractResult } from 'common/hooks/useContract'

import { COMPOSABLE_COW_ADDRESS } from '../const'

export type ComposableCowContractData = ContractData<typeof ComposableCoWAbi>

export function useComposableCowContractData(): UseContractResult<ComposableCowContractData> {
  const { chainId } = useWalletInfo()

  return {
    abi: ComposableCoWAbi,
    address: COMPOSABLE_COW_ADDRESS[chainId],
    chainId,
  }
}
