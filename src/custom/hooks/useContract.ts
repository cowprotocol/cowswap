import { Contract } from '@ethersproject/contracts'
import { useActiveWeb3React } from 'hooks'

import { useContract } from '@src/hooks/useContract'

import { GP_SETTLEMENT_CONTRACT_ADDRESS } from 'constants/index'
import { GP_V2_SETTLEMENT_INTERFACE } from 'constants/GPv2Settlement'

export * from '@src/hooks/useContract'

export function useGP2SettlementContract(): Contract | null {
  const { chainId } = useActiveWeb3React()
  return useContract(chainId && GP_SETTLEMENT_CONTRACT_ADDRESS[chainId], GP_V2_SETTLEMENT_INTERFACE, false)
}
