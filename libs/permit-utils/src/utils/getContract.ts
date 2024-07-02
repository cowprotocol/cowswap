import { Contract, ContractInterface } from '@ethersproject/contracts'
import type { JsonRpcProvider } from '@ethersproject/providers'


export function getContract(address: string, abi: ContractInterface, provider: JsonRpcProvider): Contract {
  return new Contract(address, abi, provider)
}
