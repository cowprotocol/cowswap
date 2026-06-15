import { ComposableCoWAbi } from '@cowprotocol/cowswap-abis'

import { encodeFunctionData, parseAbi } from 'viem'

import { parseSafeTransactionsResult } from './parseTwapSafeTransactions.utils'

import type { Hex } from 'viem'

const MULTISEND_ABI = parseAbi(['function multiSend(bytes transactions)'])
const COMPOSABLE_COW_ADDRESS = '0x0000000000000000000000000000000000000001'
const HANDLER_ADDRESS = '0x0000000000000000000000000000000000000002'
const FACTORY_ADDRESS = '0x0000000000000000000000000000000000000003'
const OTHER_ADDRESS = '0x0000000000000000000000000000000000000004'
const SAFE_MULTISEND_130_CANONICAL = '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
const SAFE_MULTISEND_130_EIP155 = '0x998739BFdAAdde7C933B942a68053933098f9EDa'
const SAFE_MULTISEND_ADDRESS = '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526'
const SAFE_MULTISEND_150 = '0x218543288004CD07832472D464648173c77D7eB7'
const SAFE_MULTISEND_CALL_ONLY_130_CANONICAL = '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D'
const SAFE_MULTISEND_CALL_ONLY_130_EIP155 = '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B'
const SAFE_MULTISEND_CALL_ONLY_141 = '0x9641d764fc13c8B624c04430C7356C1C7C8102e2'
const SAFE_MULTISEND_CALL_ONLY_150 = '0xA83c336B20401Af773B6219BA5027174338D1836'

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
    const batchExecutors = [
      SAFE_MULTISEND_130_CANONICAL,
      SAFE_MULTISEND_130_EIP155,
      SAFE_MULTISEND_ADDRESS,
      SAFE_MULTISEND_150,
      SAFE_MULTISEND_CALL_ONLY_130_CANONICAL,
      SAFE_MULTISEND_CALL_ONLY_130_EIP155,
      SAFE_MULTISEND_CALL_ONLY_141,
      SAFE_MULTISEND_CALL_ONLY_150,
    ] as const

    for (const executorAddress of batchExecutors) {
      const result = parseSafeTransactionsResult(composableCowContract, [
        buildSafeTransaction({
          operation: 1,
          to: executorAddress,
          data: encodeMultiSendCall([
            { operation: 0, to: OTHER_ADDRESS, data: '0xdeadbeef' },
            { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
          ]),
        }),
      ])

      expect(result).toHaveLength(1)
      expect(result[0]?.conditionalOrderParams).toEqual(CONDITIONAL_ORDER_PARAMS)
    }
  })

  it('does not accept v1.5 Safe batch executors on chains where Safe did not deploy them', () => {
    const result = parseSafeTransactionsResult(
      {
        ...composableCowContract,
        chainId: 56,
      },
      [
        buildSafeTransaction({
          operation: 1,
          to: SAFE_MULTISEND_CALL_ONLY_150,
          data: encodeMultiSendCall([{ operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA }]),
        }),
      ],
    )

    expect(result).toEqual([])
  })

  it('rejects MultiSend delegatecalls sent to a non-Safe target', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        operation: 1,
        to: OTHER_ADDRESS,
        data: encodeMultiSendCall([{ operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA }]),
      }),
    ])

    expect(result).toEqual([])
  })

  it('rejects malformed MultiSend payloads', () => {
    const result = parseSafeTransactionsResult(composableCowContract, [
      buildSafeTransaction({
        operation: 1,
        to: SAFE_MULTISEND_ADDRESS,
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
        to: SAFE_MULTISEND_ADDRESS,
        data: encodeMultiSendCall([
          { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
          { operation: 0, to: COMPOSABLE_COW_ADDRESS, data: VALID_CREATE_CALL_DATA },
        ]),
      }),
    ])

    expect(result).toEqual([])
  })
})
