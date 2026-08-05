import { decodeAbiParameters, encodeAbiParameters, type Hex } from 'viem'

/** `allowance(address,address)` */
export const ALLOWANCE_SELECTOR = '0xdd62ed3e'
/** `aggregate3((address,bool,bytes)[])` on Multicall3 */
export const AGGREGATE3_SELECTOR = '0x82ad56cb'

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

const UINT256 = [{ type: 'uint256' }] as const

const ADDRESS_PAIR = [{ type: 'address' }, { type: 'address' }] as const

export interface AllowanceCall {
  kind: 'allowance'
  token: string
  owner: string
  spender: string
}

export interface BatchCall {
  kind: 'batch'
  calls: ClassifiedCall[]
}

export type ClassifiedCall = AllowanceCall | BatchCall | OpaqueCall

export interface OpaqueCall {
  kind: 'opaque'
}

export type ResolveAllowanceCall = (call: AllowanceCall) => bigint

interface BatchResultSlot {
  success: boolean
  returnData: Hex
}

const OPAQUE: OpaqueCall = { kind: 'opaque' }

/**
 * Classify one `eth_call` by its calldata.
 *
 * Keyed on the selector, not on `to`: calldata that decodes as `aggregate3` is a
 * batch whatever it is addressed to, and not checking `to` avoids carrying a
 * chainId -> Multicall3-address table for no benefit.
 */
export function classifyCall(to: string, data: string): ClassifiedCall {
  const selector = data.slice(0, 10).toLowerCase()
  const payload = `0x${data.slice(10)}` as Hex

  if (selector === ALLOWANCE_SELECTOR) return classifyAllowance(to, payload)
  if (selector === AGGREGATE3_SELECTOR) return classifyBatch(payload)
  return OPAQUE
}

export function collectAllowanceCalls(call: ClassifiedCall): AllowanceCall[] {
  if (call.kind === 'allowance') return [call]
  if (call.kind === 'opaque') return []
  return call.calls.flatMap(collectAllowanceCalls)
}

export function encodeAllowanceResult(value: bigint): Hex {
  return encodeAbiParameters(UINT256, [value])
}

export function isFullyMocked(call: ClassifiedCall): boolean {
  if (call.kind === 'allowance') return true
  if (call.kind === 'opaque') return false
  return call.calls.every(isFullyMocked)
}

/**
 * Build the `Result[]` blob for a batch.
 *
 * With `upstream`, its slots are the base and only mocked slots are overwritten —
 * that is what keeps a mixed batch's arity and ordering correct without
 * re-encoding a filtered request. Without it (a fully-mocked batch), unmocked
 * slots would not exist, so the base is an empty failure slot.
 *
 * A mocked slot is always written as `success: true`, so a fixture token that was
 * never deployed upstream resolves cleanly instead of surfacing the revert.
 */
export function resolveBatchResult(call: BatchCall, resolve: ResolveAllowanceCall, upstream?: Hex): Hex {
  const base = upstream ? decodeResultSlots(upstream) : []

  const slots = call.calls.map((inner, index) => {
    const fallback = base[index] ?? { success: false, returnData: '0x' as Hex }

    if (inner.kind === 'allowance') {
      return { success: true, returnData: encodeAllowanceResult(resolve(inner)) }
    }
    if (inner.kind === 'batch') {
      const nestedUpstream = fallback.success ? fallback.returnData : undefined
      return { success: true, returnData: resolveBatchResult(inner, resolve, nestedUpstream) }
    }
    return fallback
  })

  return encodeAbiParameters(RESULT_TUPLE, [slots])
}

function classifyAllowance(to: string, payload: Hex): ClassifiedCall {
  try {
    const [owner, spender] = decodeAbiParameters(ADDRESS_PAIR, payload)
    return {
      kind: 'allowance',
      token: to.toLowerCase(),
      owner: owner.toLowerCase(),
      spender: spender.toLowerCase(),
    }
  } catch {
    return OPAQUE
  }
}

function classifyBatch(payload: Hex): ClassifiedCall {
  try {
    const [calls] = decodeAbiParameters(CALL3_TUPLE, payload)
    return {
      kind: 'batch',
      calls: (calls as ReadonlyArray<{ target: string; callData: string }>).map((c) =>
        classifyCall(c.target, c.callData),
      ),
    }
  } catch {
    // Undecodable calldata is not something to guess at — forward it untouched.
    return OPAQUE
  }
}

function decodeResultSlots(blob: Hex): BatchResultSlot[] {
  try {
    return [...(decodeAbiParameters(RESULT_TUPLE, blob)[0] as ReadonlyArray<BatchResultSlot>)]
  } catch {
    // An upstream error body or a truncated blob must not lose the mocked slots.
    return []
  }
}
