import type SafeApiKit from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { isTruthy } from 'legacy/utils/misc'

import { ComposableCoW } from 'abis/types'

import { ConditionalOrderParams } from '../types'

export interface TwapOrdersSafeData {
  params: ConditionalOrderParams
  submissionDate: string
  isExecuted: boolean
}

// ComposableCoW.create method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '6bfae1ca'

export async function fetchTwapOrdersFromSafe(
  safeAddress: string,
  safeApiKit: SafeApiKit,
  composableCowContract: ComposableCoW
): Promise<TwapOrdersSafeData[]> {
  const allTxs = await safeApiKit.getAllTransactions(safeAddress)
  const results = allTxs?.results || []

  return results
    .map((result) => {
      if (!result.data || !isSafeMultisigTransactionListResponse(result)) return null

      const selectorIndex = result.data.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

      if (selectorIndex < 0) return null

      const callData = '0x' + result.data.substring(selectorIndex)

      const params = parseConditionalOrderParams(safeAddress, composableCowContract, callData)

      if (!params) return null

      return {
        params,
        isExecuted: result.isExecuted,
        submissionDate: result.submissionDate,
      }
    })
    .filter(isTruthy)
}

function isSafeMultisigTransactionListResponse(response: any): response is SafeMultisigTransactionResponse {
  return !!response.data && !!response.submissionDate
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
