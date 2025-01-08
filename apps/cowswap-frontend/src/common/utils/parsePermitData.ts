import { Erc20__factory } from '@cowprotocol/abis'
import type { BigNumber } from '@ethersproject/bignumber'

const erc20Interface = Erc20__factory.createInterface()

export interface PermitParameters {
  owner: string
  spender: string
  value: BigNumber
  deadline: BigNumber
}

export function parsePermitData(callData: string): PermitParameters {
  return erc20Interface.decodeFunctionData('permit', callData) as unknown as PermitParameters
}
