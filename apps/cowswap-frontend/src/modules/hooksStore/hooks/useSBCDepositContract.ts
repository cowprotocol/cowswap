import { SBCDepositContract, SBCDepositContractAbi } from '@cowprotocol/abis'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useContract } from 'common/hooks/useContract'

import { SBC_DEPOSIT_CONTRACT_ADDRESS } from '../const'

export function useSBCDepositContract(): SBCDepositContract | null {
  const { chainId } = useWalletInfo()
  return useContract<SBCDepositContract>(
    chainId === SupportedChainId.GNOSIS_CHAIN ? SBC_DEPOSIT_CONTRACT_ADDRESS : undefined,
    SBCDepositContractAbi,
    true
  )
}
