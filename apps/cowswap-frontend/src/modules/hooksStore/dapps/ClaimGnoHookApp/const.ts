import { SBCDepositContract as SBCDepositContractType, SBCDepositContractAbi } from '@cowprotocol/abis'
import { Contract } from '@ethersproject/contracts'

export const SBC_DEPOSIT_CONTRACT_ADDRESS = '0x0B98057eA310F4d31F2a452B414647007d1645d9'

export const SBCDepositContract = new Contract(
  SBC_DEPOSIT_CONTRACT_ADDRESS,
  SBCDepositContractAbi,
) as SBCDepositContractType
