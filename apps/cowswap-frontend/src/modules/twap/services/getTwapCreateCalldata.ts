import { encodeFunctionData } from 'viem'

import { ComposableCowContractData } from 'modules/advancedOrders'

import { ConditionalOrderParams } from '../types'

export interface GetTwapCreateCalldataParams {
  composableCowContractAbi: ComposableCowContractData['abi']
  paramsStruct: ConditionalOrderParams
  currentBlockFactoryAddress: string
}

export function getCreateTwapOrderCalldata({
  composableCowContractAbi,
  paramsStruct,
  currentBlockFactoryAddress,
}: GetTwapCreateCalldataParams): `0x${string}` {
  return encodeFunctionData({
    abi: composableCowContractAbi,
    functionName: 'createWithContext',
    args: [
      paramsStruct as { handler: `0x${string}`; salt: `0x${string}`; staticInput: `0x${string}` },
      currentBlockFactoryAddress as `0x${string}`,
      '0x',
      true,
    ],
  })
}
