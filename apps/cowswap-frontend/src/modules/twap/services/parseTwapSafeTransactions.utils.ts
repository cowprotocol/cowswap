import { isTruthy } from '@cowprotocol/common-utils'
import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { decodeFunctionData, parseAbi } from 'viem'

import { ComposableCowContractData } from 'modules/advancedOrders'

import { SafeTransactionParams } from 'common/types'

import { ConditionalOrderParams, TwapOrdersSafeData } from '../types'

import type { Hex } from 'viem'

const MULTISEND_ABI = parseAbi(['function multiSend(bytes transactions)'])
const MULTISEND_HEADER_HEX_LENGTH = 170
const MAX_SAFE_HEX_LENGTH = BigInt(Number.MAX_SAFE_INTEGER)

interface SafeMultisigTransactionCandidate {
  confirmations?: unknown[] | null
  confirmationsRequired: number
  data: Hex
  executionDate: string | null
  isExecuted: boolean
  nonce: string
  operation: number
  safeTxHash: string
  submissionDate: string
  to: string
}

interface DecodedMultiSendTransaction {
  data: Hex
  operation: number
  to: string
}

export function parseSafeTransactionsResult(
  composableCowContract: ComposableCowContractData,
  results: unknown[],
): TwapOrdersSafeData[] {
  return results
    .map<TwapOrdersSafeData | null>((result) => {
      const safeTransaction = getSafeMultisigTransactionCandidate(result)

      if (!safeTransaction) {
        return null
      }

      const conditionalOrderParams = getConditionalOrderParamsFromSafeTransaction(
        composableCowContract,
        safeTransaction,
      )

      if (!conditionalOrderParams) {
        return null
      }

      return {
        conditionalOrderParams,
        safeTxParams: getSafeTransactionParams(safeTransaction),
      }
    })
    .filter(isTruthy)
}

function getConditionalOrderParamsFromSafeTransaction(
  composableCowContract: ComposableCowContractData,
  transaction: SafeMultisigTransactionCandidate,
): ConditionalOrderParams | null {
  const directCall = parseDirectComposableCowCall(composableCowContract, transaction)

  if (directCall) {
    return directCall
  }

  const innerTransactions = decodeMultiSendTransactions(transaction)

  if (!innerTransactions) {
    return null
  }

  const matchedCalls = innerTransactions
    .filter((innerTransaction) => {
      return innerTransaction.operation === 0 && areAddressesEqual(innerTransaction.to, composableCowContract.address)
    })
    .map((innerTransaction) => parseConditionalOrderParams(composableCowContract, innerTransaction.data))
    .filter(isTruthy)

  return matchedCalls.length === 1 ? matchedCalls[0] : null
}

function parseDirectComposableCowCall(
  composableCowContract: ComposableCowContractData,
  transaction: SafeMultisigTransactionCandidate,
): ConditionalOrderParams | null {
  if (transaction.operation !== 0) {
    return null
  }

  if (!areAddressesEqual(transaction.to, composableCowContract.address)) {
    return null
  }

  return parseConditionalOrderParams(composableCowContract, transaction.data)
}

function decodeMultiSendTransactions(
  transaction: SafeMultisigTransactionCandidate,
): DecodedMultiSendTransaction[] | null {
  if (transaction.operation !== 1) {
    return null
  }

  try {
    const { args, functionName } = decodeFunctionData({
      abi: MULTISEND_ABI,
      data: transaction.data,
    })

    if (functionName !== 'multiSend') {
      return null
    }

    const [transactions] = args

    if (typeof transactions !== 'string') {
      return null
    }

    return parseMultiSendTransactions(transactions)
  } catch {
    return null
  }
}

function parseMultiSendTransactions(transactions: Hex): DecodedMultiSendTransaction[] | null {
  const encodedTransactions = transactions.slice(2)
  const decodedTransactions: DecodedMultiSendTransaction[] = []
  let cursor = 0

  while (cursor < encodedTransactions.length) {
    if (encodedTransactions.length - cursor < MULTISEND_HEADER_HEX_LENGTH) {
      return null
    }

    const operationHex = encodedTransactions.slice(cursor, cursor + 2)
    const toHex = encodedTransactions.slice(cursor + 2, cursor + 42)
    const dataLengthHex = encodedTransactions.slice(cursor + 106, cursor + 170)
    const dataLength = hexLengthToNumber(dataLengthHex)

    if (dataLength === null) {
      return null
    }

    const dataStart = cursor + MULTISEND_HEADER_HEX_LENGTH
    const dataEnd = dataStart + dataLength * 2

    if (dataEnd > encodedTransactions.length) {
      return null
    }

    decodedTransactions.push({
      operation: Number.parseInt(operationHex, 16),
      to: `0x${toHex}`,
      data: `0x${encodedTransactions.slice(dataStart, dataEnd)}`,
    })

    cursor = dataEnd
  }

  return decodedTransactions
}

function hexLengthToNumber(value: string): number | null {
  try {
    const decoded = BigInt(`0x${value}`)

    if (decoded > MAX_SAFE_HEX_LENGTH) {
      return null
    }

    return Number(decoded)
  } catch {
    return null
  }
}

function getSafeMultisigTransactionCandidate(value: unknown): SafeMultisigTransactionCandidate | null {
  if (!isRecord(value)) {
    return null
  }

  if (!hasRequiredSafeTransactionFields(value) || !hasOptionalSafeTransactionFields(value)) {
    return null
  }

  return {
    confirmations: value.confirmations as unknown[] | null | undefined,
    confirmationsRequired: value.confirmationsRequired as number,
    data: value.data as Hex,
    executionDate: (value.executionDate ?? null) as string | null,
    isExecuted: value.isExecuted as boolean,
    nonce: value.nonce as string,
    operation: value.operation as number,
    safeTxHash: value.safeTxHash as string,
    submissionDate: value.submissionDate as string,
    to: value.to as string,
  }
}

function hasRequiredSafeTransactionFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.data === 'string' &&
    typeof value.to === 'string' &&
    typeof value.operation === 'number' &&
    typeof value.submissionDate === 'string' &&
    typeof value.isExecuted === 'boolean' &&
    typeof value.nonce === 'string' &&
    typeof value.confirmationsRequired === 'number' &&
    typeof value.safeTxHash === 'string'
  )
}

function hasOptionalSafeTransactionFields(value: Record<string, unknown>): boolean {
  const executionDateIsValid = value.executionDate === null || typeof value.executionDate === 'string'
  const confirmationsAreValid =
    value.confirmations === undefined || value.confirmations === null || Array.isArray(value.confirmations)

  return executionDateIsValid && confirmationsAreValid
}

function parseConditionalOrderParams(
  composableCowContract: ComposableCowContractData,
  callData: Hex,
): ConditionalOrderParams | null {
  try {
    const { args, functionName } = decodeFunctionData({
      abi: composableCowContract.abi,
      data: callData,
    })

    if (functionName !== 'createWithContext') {
      return null
    }

    const [params] = args as unknown as [ConditionalOrderParams]

    return { handler: params.handler, salt: params.salt, staticInput: params.staticInput }
  } catch {
    return null
  }
}

function getSafeTransactionParams(result: SafeMultisigTransactionCandidate): SafeTransactionParams {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
