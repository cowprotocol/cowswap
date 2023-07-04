import { useMemo } from 'react'

import { ComposableCoW, GPv2Order } from '@cowprotocol/abis'
import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'

import { useSingleContractMultipleData } from 'lib/hooks/multicall'

import { ConditionalOrderParams } from '../types'

const DEFAULT_LISTENER_OPTIONS: ListenerOptionsWithGas = { gasRequired: 185_000, blocksPerFetch: 5 }

export type TradeableOrderWithSignature =
  | {
      order: GPv2Order.DataStructOutput
      signature: string
    }
  | undefined

export function useTwapOrdersTradeableMulticall(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  conditionalOrderParams: ConditionalOrderParams[]
): TradeableOrderWithSignature[] {
  const input = useMemo(() => {
    return conditionalOrderParams.map((params) => {
      return [safeAddress, [params.handler, params.salt, params.staticInput], '0x', []]
    })
  }, [safeAddress, conditionalOrderParams])

  const results = useSingleContractMultipleData(
    composableCowContract,
    'getTradeableOrderWithSignature',
    input,
    DEFAULT_LISTENER_OPTIONS
  )

  return useMemo(() => {
    return results.filter((result) => !result.loading).map((res) => res.result as TradeableOrderWithSignature)
  }, [results])
}
