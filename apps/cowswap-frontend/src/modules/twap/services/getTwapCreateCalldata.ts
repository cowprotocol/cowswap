import { encodeFunctionData } from 'viem'

import { ConditionalOrderParams } from '../types'
import { ComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

export interface GetTwapCreateCalldataParams {
  composableCowContractAbi: ComposableCowContractData["abi"]
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
