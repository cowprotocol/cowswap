import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, erc20Abi, type Hex } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { strict as assert } from 'node:assert'
import { test } from 'node:test'

import {
  AGGREGATE3_SELECTOR,
  classifyCall,
  collectAllowanceCalls,
  encodeAllowanceResult,
  isFullyMocked,
  resolveBatchResult,
  type AllowanceCall,
  type BatchCall,
} from './codec'

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'
const OWNER = '0x1111111111111111111111111111111111111111'
const SPENDER = '0x2222222222222222222222222222222222222222'
const TOKEN_A = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14'
const TOKEN_B = '0x0625afb445c3b6b7b929342a04a22599fd5dbb59'

const CALL3_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'target', type: 'address' },
      { name: 'allowFailure', type: 'bool' },
      { name: 'callData', type: 'bytes' },
    ],
  },
] as const

const RESULT_TUPLE = [
  {
    type: 'tuple[]',
    components: [
      { name: 'success', type: 'bool' },
      { name: 'returnData', type: 'bytes' },
    ],
  },
] as const

function aggregate3Calldata(calls: Array<{ target: string; callData: Hex }>): Hex {
  const encoded = encodeAbiParameters(CALL3_TUPLE, [
    calls.map((c) => ({ target: c.target as Hex, allowFailure: true, callData: c.callData })),
  ])
  return `${AGGREGATE3_SELECTOR}${encoded.slice(2)}` as Hex
}

function allowanceCalldata(owner: string, spender: string): Hex {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner as Hex, spender as Hex],
  })
}

function balanceOfCalldata(owner: string): Hex {
  return encodeFunctionData({ abi: erc20Abi, functionName: 'balanceOf', args: [owner as Hex] })
}

function decodeResults(blob: Hex): ReadonlyArray<{ success: boolean; returnData: Hex }> {
  return decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<{ success: boolean; returnData: Hex }>
}

const resolveTo = (value: bigint) => () => value

test('classifies a direct allowance call', () => {
  const call = classifyCall(TOKEN_A, allowanceCalldata(OWNER, SPENDER))

  assert.deepEqual(call, {
    kind: 'allowance',
    token: getAddressKey(TOKEN_A),
    owner: getAddressKey(OWNER),
    spender: getAddressKey(SPENDER),
  })
})

test('classifies a non-allowance call as opaque', () => {
  assert.deepEqual(classifyCall(TOKEN_A, balanceOfCalldata(OWNER)), { kind: 'opaque' })
})

test('classifies empty and truncated calldata as opaque', () => {
  assert.deepEqual(classifyCall(TOKEN_A, '0x'), { kind: 'opaque' })
  assert.deepEqual(classifyCall(TOKEN_A, '0xdd62ed3e'), { kind: 'opaque' })
})

test('classifies an aggregate3 batch, keeping call order', () => {
  const data = aggregate3Calldata([
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
  ])

  const call = classifyCall(MULTICALL3, data) as BatchCall

  assert.equal(call.kind, 'batch')
  assert.equal(call.calls.length, 2)
  assert.equal(call.calls[0].kind, 'allowance')
  assert.equal((call.calls[0] as AllowanceCall).token, TOKEN_A.toLowerCase())
  assert.equal(call.calls[1].kind, 'opaque')
})

test('classifies a batch by selector regardless of the target address', () => {
  const data = aggregate3Calldata([{ target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) }])

  assert.equal(classifyCall('0x9999999999999999999999999999999999999999', data).kind, 'batch')
})

test('classifies a nested aggregate3 recursively', () => {
  const inner = aggregate3Calldata([{ target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) }])
  const outer = aggregate3Calldata([{ target: MULTICALL3, callData: inner }])

  const call = classifyCall(MULTICALL3, outer) as BatchCall
  const nested = call.calls[0] as BatchCall

  assert.equal(nested.kind, 'batch')
  assert.equal(nested.calls[0].kind, 'allowance')
})

test('classifies malformed aggregate3 calldata as opaque instead of throwing', () => {
  assert.deepEqual(classifyCall(MULTICALL3, `${AGGREGATE3_SELECTOR}deadbeef` as Hex), { kind: 'opaque' })
})

test('isFullyMocked is true only when every leaf is an allowance call', () => {
  const allAllowances = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  )
  const mixed = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
    ]),
  )

  assert.equal(isFullyMocked(allAllowances), true)
  assert.equal(isFullyMocked(mixed), false)
  assert.equal(isFullyMocked({ kind: 'opaque' }), false)
  assert.equal(isFullyMocked(classifyCall(TOKEN_A, allowanceCalldata(OWNER, SPENDER))), true)
})

test('an empty batch is fully mocked and encodes an empty result array', () => {
  const call = classifyCall(MULTICALL3, aggregate3Calldata([])) as BatchCall

  assert.equal(isFullyMocked(call), true)
  assert.equal(decodeResults(resolveBatchResult(call, resolveTo(1n))).length, 0)
})

test('collectAllowanceCalls flattens nested batches in order', () => {
  const inner = aggregate3Calldata([{ target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) }])
  const outer = aggregate3Calldata([
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    { target: MULTICALL3, callData: inner },
  ])

  const tokens = collectAllowanceCalls(classifyCall(MULTICALL3, outer)).map((c) => c.token)

  assert.deepEqual(tokens, [TOKEN_A.toLowerCase(), TOKEN_B.toLowerCase()])
})

test('encodeAllowanceResult produces a 32-byte uint256', () => {
  const encoded = encodeAllowanceResult(5000000n)

  assert.equal(encoded.length, 66)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], encoded)[0], 5000000n)
})

test('resolveBatchResult fills every slot when the batch is fully mocked', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const results = decodeResults(resolveBatchResult(call, (c) => (c.token === TOKEN_A.toLowerCase() ? 7n : 9n)))

  assert.equal(results.length, 2)
  assert.equal(results[0].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[0].returnData)[0], 7n)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 9n)
})

test('resolveBatchResult overwrites only mocked slots and preserves upstream ones', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
      { target: TOKEN_B, callData: balanceOfCalldata(SPENDER) },
    ]),
  ) as BatchCall

  const upstreamBalance = encodeAllowanceResult(123n)
  const upstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: upstreamBalance },
      { success: false, returnData: '0x' as Hex },
      { success: true, returnData: '0x' as Hex },
    ],
  ])

  const results = decodeResults(resolveBatchResult(call, resolveTo(555n), upstream))

  assert.equal(results.length, 3)
  assert.equal(results[0].returnData, upstreamBalance)
  assert.equal(results[0].success, true)
  assert.equal(results[1].success, true)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 555n)
  assert.equal(results[2].success, true)
  assert.equal(results[2].returnData, '0x')
})

test('resolveBatchResult patches inside a nested batch', () => {
  const inner = aggregate3Calldata([
    { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
    { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
  ])
  const call = classifyCall(MULTICALL3, aggregate3Calldata([{ target: MULTICALL3, callData: inner }])) as BatchCall

  const innerUpstream = encodeAbiParameters(RESULT_TUPLE, [
    [
      { success: true, returnData: encodeAllowanceResult(1n) },
      { success: false, returnData: '0x' as Hex },
    ],
  ])
  const upstream = encodeAbiParameters(RESULT_TUPLE, [[{ success: true, returnData: innerUpstream }]])

  const outerResults = decodeResults(resolveBatchResult(call, resolveTo(42n), upstream))
  const innerResults = decodeResults(outerResults[0].returnData)

  assert.equal(decodeAbiParameters([{ type: 'uint256' }], innerResults[0].returnData)[0], 1n)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], innerResults[1].returnData)[0], 42n)
})

test('resolveBatchResult tolerates an upstream blob it cannot decode', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const results = decodeResults(resolveBatchResult(call, resolveTo(8n), '0xdeadbeef'))

  assert.equal(results.length, 2)
  assert.equal(results[0].success, false)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 8n)
})

test('resolveBatchResult tolerates an upstream blob with too few slots', () => {
  const call = classifyCall(
    MULTICALL3,
    aggregate3Calldata([
      { target: TOKEN_B, callData: balanceOfCalldata(OWNER) },
      { target: TOKEN_A, callData: allowanceCalldata(OWNER, SPENDER) },
    ]),
  ) as BatchCall

  const upstream = encodeAbiParameters(RESULT_TUPLE, [[{ success: true, returnData: '0x' as Hex }]])
  const results = decodeResults(resolveBatchResult(call, resolveTo(8n), upstream))

  assert.equal(results.length, 2)
  assert.equal(decodeAbiParameters([{ type: 'uint256' }], results[1].returnData)[0], 8n)
})
