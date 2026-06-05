import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'

import { encodeFunctionData, parseAbi } from 'viem'

import { parseSafeTransactionsResult } from './parseTwapSafeTransactions.utils'

import type { Hex } from 'viem'

const MULTISEND_ABI = parseAbi(['function multiSend(bytes transactions)'])
const COMPOSABLE_COW_ADDRESS = '0x0000000000000000000000000000000000000001'
const HANDLER_ADDRESS = '0x0000000000000000000000000000000000000002'
const FACTORY_ADDRESS = '0x0000000000000000000000000000000000000003'
const OTHER_ADDRESS = '0x0000000000000000000000000000000000000004'

const CONDITIONAL_ORDER_PARAMS = {
  handler: HANDLER_ADDRESS,
  salt: `0x${'11'.repeat(32)}`,
  staticInput: '0x1234',
} as const

const composableCowContract = {
  abi: ComposableCoWAbi,
  address: COMPOSABLE_COW_ADDRESS,
  chainId: 1,
}

const VALID_CREATE_CALL_DATA = encodeFunctionData({
  abi: ComposableCoWAbi,
  functionName: 'createWithContext',
  args: [CONDITIONAL_ORDER_PARAMS, FACTORY_ADDRESS, '0x', false],
})

function buildSafeTransaction(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    confirmations: [],
    confirmationsRequired: 2,
    data: VALID_CREATE_CALL_DATA,
    executionDate: null,
    isExecuted: false,
    nonce: '1',
    operation: 0,
    safeTxHash: '0xsafehash',
    submissionDate: '2026-06-05T00:00:00Z',
    to: COMPOSABLE_COW_ADDRESS,
    ...overrides,
  }
}

function encodeMultiSendCall(
  transactions: Array<{
    operation: number
    to: string
    data: Hex
  }>,
): Hex {
  const encodedTransactions = `0x${transactions.map(encodeMultiSendTransaction).join('')}` as Hex

  return encodeFunctionData({
    abi: MULTISEND_ABI,
    functionName: 'multiSend',
    args: [encodedTransactions],
  })
}

function encodeMultiSendTransaction(transaction: { operation: number; to: string; data: Hex }): string {
  const operationHex = transaction.operation.toString(16).padStart(2, '0')
  const toHex = transaction.to.slice(2)
  const valueHex = ''.padStart(64, '0')
  const dataHex = transaction.data.slice(2)
  const dataLengthHex = (dataHex.length / 2).toString(16).padStart(64, '0')

  return `${operationHex}${toHex}${valueHex}${dataLengthHex}${dataHex}`
}

describe('parseSafeTransactionsResult', () => {
  it('decodes a direct valid TWAP call', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [buildSafeTransaction()])

    expect(result).toHaveLength(1)
    expect(result[0]?.conditionalOrderParams).toEqual(CONDITIONAL_ORDER_PARAMS)
  })

  it('does not match unrelated direct calls', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({ to: OTHER_ADDRESS, data: '0xdeadbeef' }),
    ])

    expect(result).toEqual([])
  })

  it('does not match malformed direct calldata', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [buildSafeTransaction({ data: '0x0d0d9800' })])

    expect(result).toEqual([])
  })

  it('removes selector-substring false positives from unrelated direct calls', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        to: OTHER_ADDRESS,
        data: `0xdeadbeef${VALID_CREATE_CALL_DATA.slice(2)}` as Hex,
      }),
    ])

    expect(result).toEqual([])
  })

  it('decodes a valid MultiSend bundle containing one TWAP inner call', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        operation: 1,
        to: '0x0000000000000000000000000000000000000005',
        data: encodeMultiSendCall([
          { operation: 0, to: OTHER_ADDRESS, data: '0xdeadbeef' },
          { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
        ]),
      }),
    ])

    expect(result).toHaveLength(1)
    expect(result[0]?.conditionalOrderParams).toEqual(CONDITIONAL_ORDER_PARAMS)
  })

  it('rejects malformed MultiSend payloads', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        operation: 1,
        to: '0x0000000000000000000000000000000000000005',
        data: encodeFunctionData({
          abi: MULTISEND_ABI,
          functionName: 'multiSend',
          args: ['0x00'],
        }),
      }),
    ])

    expect(result).toEqual([])
  })

  it('rejects ambiguous MultiSend bundles with multiple TWAP inner calls', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        operation: 1,
        to: '0x0000000000000000000000000000000000000005',
        data: encodeMultiSendCall([
          { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
          { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
        ]),
      }),
    ])

    expect(result).toEqual([])
  })
})
