import { ComposableCoW } from '@cowprotocol/abis'
import type SafeApiKit from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

import { isTruthy } from 'legacy/utils/misc'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

// ComposableCoW.createWithContext method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '0d0d9800'

export async function fetchTwapOrdersFromSafe(
  safeAddress: string,
  safeApiKit: SafeApiKit,
  composableCowContract: ComposableCoW
): Promise<TwapOrdersSafeData[]> {
  const allTxs = await safeApiKit.getAllTransactions(safeAddress)
  const results = allTxs?.results || []

  return results
    .map<TwapOrdersSafeData | null>((result) => {
      if (!result.data || !isSafeMultisigTransactionListResponse(result)) return null

      const selectorIndex = result.data.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

      if (selectorIndex < 0) return null

      const callData = '0x' + result.data.substring(selectorIndex)

      const conditionalOrderParams = parseConditionalOrderParams(safeAddress, composableCowContract, callData)

      if (!conditionalOrderParams) return null

      const safeTxParams = getSafeTransactionParams(result)

      return {
        conditionalOrderParams,
        safeTxParams,
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
    const _result = composableCowContract.interface.decodeFunctionData('createWithContext', callData)
    const { params } = _result as any as { params: ConditionalOrderParams }

    return { handler: params.handler, salt: params.salt, staticInput: params.staticInput }
  } catch (e) {
    return null
  }
}

function getSafeTransactionParams(result: SafeMultisigTransactionResponse): SafeTransactionParams {
  const { isExecuted, submissionDate, executionDate, nonce, confirmationsRequired, confirmations, safeTxHash } = result

  return {
    isExecuted,
    submissionDate,
    executionDate,
    confirmationsRequired,
    confirmations: confirmations?.length || 0,
    safeTxHash,
    nonce,
  }
}
