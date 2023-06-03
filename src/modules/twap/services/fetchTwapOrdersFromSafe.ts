import type SafeApiKit from '@safe-global/api-kit'
import type { DataDecoded } from '@safe-global/safe-gateway-typescript-sdk'

import { isTruthy } from 'legacy/utils/misc'

import { ComposableCoW } from 'abis/types'

import { ConditionalOrderParams } from '../types'

export interface TwapOrdersSafeData {
  params: ConditionalOrderParams
  submissionDate: string
  isExecuted: boolean
}

export async function fetchTwapOrdersFromSafe(
  safeAddress: string,
  safeApiKit: SafeApiKit,
  composableCowContract: ComposableCoW
): Promise<TwapOrdersSafeData[]> {
  const allTxs = await safeApiKit.getMultisigTransactions(safeAddress)
  const results = allTxs?.results || []

  return results
    .map((result) => {
      const dataDecoded = result.dataDecoded as DataDecoded | undefined
      const valueDecoded = dataDecoded?.parameters?.[0]?.valueDecoded || []
      const callDatas = valueDecoded.map((value) => value.data)

      return callDatas
        .map((callData) => {
          if (!callData) return null

          const params = parseConditionalOrderParams(safeAddress, composableCowContract, callData)

          if (!params) return null

          return {
            params,
            isExecuted: result.isExecuted,
            submissionDate: result.submissionDate,
          }
        })
        .filter(isTruthy)
    })
    .flat()
}

function parseConditionalOrderParams(
  safeAddress: string,
  composableCowContract: ComposableCoW,
  callData: string
): ConditionalOrderParams | null {
  try {
    const _result = composableCowContract.interface.decodeFunctionData('create', callData)
    const { params } = _result as any as { params: ConditionalOrderParams }

    return { handler: params.handler, salt: params.salt, staticInput: params.staticInput }
  } catch (e) {
    return null
  }
}
