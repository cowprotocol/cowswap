import { ComposableCoW } from '@cowprotocol/abis'
import { delay, isTruthy } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  getMultisigTransactions,
  getTransactionDetails,
  TwapOrder,
  MultisigExecutionDetails,
  MultisigTransaction,
  SafeMultisigTransactionsResponse,
  Transaction,
  type TransactionDetails,
  TransactionInfoType,
} from '@safe-global/safe-gateway-typescript-sdk'

import ms from 'ms.macro'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

// ComposableCoW.createWithContext method
const CREATE_COMPOSABLE_ORDER_SELECTOR = '0d0d9800'
// Each page contains 20 transactions by default, so we need to fetch 10 pages to get 200 transactions
const SAFE_TX_HISTORY_DEPTH = 10
// Just in case, make a short delay between requests
const SAFE_TX_REQUEST_DELAY = ms`100ms`

export async function fetchTwapOrdersFromSafe(
  safeAddress: string,
  chainId: SupportedChainId,
  composableCowContract: ComposableCoW,
  /**
   * Example of the second chunk url:
   * https://safe-transaction-goerli.safe.global/api/v1/safes/0xe9B79591E270B3bCd0CC7e84f7B7De74BA3D0E2F/all-transactions/?executed=false&limit=20&offset=40&queued=true&trusted=true
   */
  nextUrl?: string,
  accumulator: TwapOrdersSafeData[][] = [],
): Promise<TwapOrdersSafeData[]> {
  const response = await fetchSafeTransactionsChunk(safeAddress, chainId, nextUrl)

  const results = response?.results || []
  const parsedResults = await parseSafeTranasctionsResult(chainId, composableCowContract, results)

  accumulator.push(parsedResults)

  // Exit from the recursion if we have enough transactions or there is no next page
  if (accumulator.length >= SAFE_TX_HISTORY_DEPTH || !response?.next) {
    return accumulator.flat()
  }

  return fetchTwapOrdersFromSafe(safeAddress, chainId, composableCowContract, response.next, accumulator)
}

async function fetchSafeTransactionsChunk(
  safeAddress: string,
  chainId: SupportedChainId,
  nextUrl?: string,
): Promise<SafeMultisigTransactionsResponse> {
  const result = await getMultisigTransactions(chainId.toString(), safeAddress, undefined, nextUrl)

  await delay(SAFE_TX_REQUEST_DELAY)

  return result
}

async function parseSafeTranasctionsResult(
  chainId: SupportedChainId,
  composableCowContract: ComposableCoW,
  results: MultisigTransaction[],
): Promise<TwapOrdersSafeData[]> {
  const twapTransactions = results.filter((result) => {
    const txInfo = result.transaction.txInfo as unknown as TwapOrder

    return txInfo.type === TransactionInfoType.TWAP_ORDER
  }) as Transaction[]

  return Promise.all(
    twapTransactions.map((tx) => {
      return getTransactionDetails(chainId.toString(), tx.transaction.id)
    }),
  ).then((details) => {
    return details
      .map((data) => {
        const hexData = data.txData?.hexData

        if (!hexData) return null

        const selectorIndex = hexData.indexOf(CREATE_COMPOSABLE_ORDER_SELECTOR)

        if (selectorIndex < 0) return null

        const callData = '0x' + hexData.substring(selectorIndex)

        const conditionalOrderParams = parseConditionalOrderParams(composableCowContract, callData)

        if (!conditionalOrderParams) return null

        const safeTxParams = getSafeTransactionParams(data)

        return {
          conditionalOrderParams,
          safeTxParams,
        }
      })
      .filter(isTruthy)
  })
}

function parseConditionalOrderParams(
  composableCowContract: ComposableCoW,
  callData: string,
): ConditionalOrderParams | null {
  try {
    const _result = composableCowContract.interface.decodeFunctionData('createWithContext', callData)
    const { params } = _result as any as { params: ConditionalOrderParams }

    return { handler: params.handler, salt: params.salt, staticInput: params.staticInput }
  } catch {
    return null
  }
}

function getSafeTransactionParams(result: TransactionDetails): SafeTransactionParams {
  const { executedAt } = result

  const detailedExecutionInfo = result.detailedExecutionInfo as MultisigExecutionDetails

  const { safeTxHash, submittedAt, confirmationsRequired, confirmations, nonce } = detailedExecutionInfo

  return {
    isExecuted: !!executedAt,
    submissionDate: new Date(submittedAt).toISOString(),
    executionDate: executedAt ? new Date(executedAt).toISOString() : null,
    confirmationsRequired: confirmationsRequired,
    confirmations: confirmations?.length || 0,
    safeTxHash,
    nonce,
  }
}
