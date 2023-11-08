import type { JsonRpcProvider } from '@ethersproject/providers'

import { Contract, ContractInterface } from '@ethersproject/contracts'

export function getContract(address: string, abi: ContractInterface, provider: JsonRpcProvider): Contract {
  return new Contract(address, abi, provider)
}
