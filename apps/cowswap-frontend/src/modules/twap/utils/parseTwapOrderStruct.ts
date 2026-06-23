import { decodeAbiParameters, type Hex } from 'viem'

import { TWAP_ORDER_STRUCT } from '../const'
import { TWAPOrderStruct } from '../types'

export function parseTwapOrderStruct(staticInput: Hex): TWAPOrderStruct {
  const [data] = decodeAbiParameters(TWAP_ORDER_STRUCT, staticInput)
  const { sellToken, buyToken, receiver, partSellAmount, minPartLimit, t0, n, t, span, appData } = data

  return {
    sellToken,
    buyToken,
    receiver,
    partSellAmount: partSellAmount.toString(),
    minPartLimit: minPartLimit.toString(),
    t0: Number(t0),
    n: Number(n),
    t: Number(t),
    span: Number(span),
    appData,
  }
}
