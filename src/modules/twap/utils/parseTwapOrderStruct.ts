import { defaultAbiCoder, ParamType } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'

import { TWAPOrderStruct } from '../types'

const TWAP_STRUCT_ABI = [
  { name: 'sellToken', type: 'address' },
  { name: 'buyToken', type: 'address' },
  { name: 'receiver', type: 'address' },
  { name: 'partSellAmount', type: 'uint256' },
  { name: 'minPartLimit', type: 'uint256' },
  { name: 't0', type: 'uint256' },
  { name: 'n', type: 'uint256' },
  { name: 't', type: 'uint256' },
  { name: 'span', type: 'uint256' },
  { name: 'appData', type: 'bytes32' },
] as ParamType[]

export function parseTwapOrderStruct(staticInput: string): TWAPOrderStruct {
  const rawData = defaultAbiCoder.decode(TWAP_STRUCT_ABI, staticInput)

  return {
    sellToken: rawData['sellToken'],
    buyToken: rawData['buyToken'],
    receiver: rawData['receiver'],
    partSellAmount: (rawData['partSellAmount'] as BigNumber).toHexString(),
    minPartLimit: (rawData['minPartLimit'] as BigNumber).toHexString(),
    t0: (rawData['t0'] as BigNumber).toNumber(),
    n: (rawData['n'] as BigNumber).toNumber(),
    t: (rawData['t'] as BigNumber).toNumber(),
    span: (rawData['span'] as BigNumber).toNumber(),
    appData: rawData['appData'],
  }
}
