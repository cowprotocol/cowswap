import {
  Address,
  decodeFunctionData,
  decodeFunctionResult,
  encodeAbiParameters,
  encodeFunctionResult,
  Hex,
  multicall3Abi,
} from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { mockRpcNodeRequest, type JsonRpcEntry, type TransactionParams } from './mockRpcNodeRequest'
import { registerNestedCallResolver, resolveNestedCall } from './nestedRpcCallRegistry'

import { getBalancesMock } from '../mocks/balances'

import type { BrowserContext } from '@playwright/test'

type Aggregate3Calls = {
  allowFailure: boolean
  callData: Hex
  target: Address
}

type Aggregate3Result = {
  returnData: Hex
  success: boolean
}

/** `aggregate3((address,bool,bytes)[])` on Multicall3 — the same selector `mocks/multicall3.ts`
 * and `mocks/allowances/codec.ts` each derive independently; duplicated here too rather than
 * imported so this mock stays a standalone, dependency-free unit like `ethBlockNumber.ts`. */
const AGGREGATE3_SELECTOR = '0x82ad56cb'

/** Same pseudo-address `cross-chain-swaps.spec.ts` seeds native ETH balances under via
 * `mocks.balances.set(owner, chainId, { [NATIVE_ETH]: ... })` — reused here, rather than a new
 * convention, to answer a `getEthBalance` call with whatever `mocks/balances` already tells the app
 * for this wallet, instead of an unrelated value that could silently disagree with it. */
const NATIVE_ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

/** Used when `mocks/balances` has nothing set for this address (or `installBalances` was never
 * called for this `context`) — good enough to let the batch resolve locally without a real fetch,
 * for a caller that doesn't otherwise care about the real balance. */
const FALLBACK_NATIVE_BALANCE = 10n ** 18n

/**
 *
 * mockContractViewCall(context, '{USDC_ADDRESS}', toFunctionSelector('allowance(address,address)', (callData) => {
 *   const { args: [account, spender] } = decodeFunctionData({
 *     abi: erc20Abi,
 *     data: callData,
 *   })
 *
 *   if (account === myAccount) return 10000000n
 * }))
 */
export function mockContractViewCall(
  context: BrowserContext,
  contractAddress: string | undefined,
  selector: string,
  resolve: (callData: Hex, target: Address) => unknown,
): void {
  const isTarget = (call: { to?: Address; data?: Hex }): boolean => isTargetCall(call, selector, contractAddress)
  // Wired to whatever `installBalances` registered for this same `context` — see
  // `getBalancesMock`'s doc comment — so every caller answers a `getEthBalance` side-call
  // consistently with `mocks/balances`'s own state, without threading a resolver through by hand.
  const getNativeBalance = (address: Address): bigint | undefined =>
    getBalancesMock(context)?.getBalance(address, NATIVE_ETH_ADDRESS)

  // Makes this call recognizable by a *different* mock's own, separate batch-merge logic (e.g.
  // `mockEthFlowTransaction.ts`'s `resolveEthBalanceBatch`) when the two land in the same
  // Multicall3 batch purely by viem's incidental request batching — see
  // `nestedRpcCallRegistry.ts`'s doc comment. Automatic for every caller of this function, so
  // nothing else needs to opt in by hand.
  registerNestedCallResolver(context, (target, callData) =>
    isTarget({ to: target, data: callData }) ? resolve(callData, target) : undefined,
  )

  mockRpcNodeRequest(
    context,
    'eth_call',
    // eslint-disable-next-line complexity
    (entry, upstreamResult) => {
      const call = entry.params?.[0] as TransactionParams
      if (!call?.to || !call?.data || !call.to) {
        return undefined
      }

      if (isTarget(call)) {
        // Direct smart-contract call
        const result = resolve(call.data, call.to)

        return result
      }

      // Multicall — `isMulticall` already confirms `call.data`'s selector is `aggregate3`'s, so
      // decoding it against `multicall3Abi` can only ever produce that one function.
      if (isMulticall(call)) {
        const { args } = decodeFunctionData({
          abi: multicall3Abi,
          data: call.data,
        })
        // `functionName` isn't checked — `isMulticall` above already guarantees it — so `args`'
        // inferred type still spans every `multicall3Abi` function; assert the one shape it can
        // structurally only be here.
        const calls = args[0] as Readonly<Aggregate3Calls[]>

        const resolved = calls.map((call) =>
          isTarget({ to: call.target, data: call.callData })
            ? resolve(call.callData, call.target)
            : answerIncidentalCall(context, call.target, call.callData, getNativeBalance),
        )

        if (resolved.every((result) => typeof result !== 'undefined')) {
          // All calls are matching
          const result = packAggregate3Result(
            resolved.map((returnData) => ({ success: true, returnData: returnData as Hex })),
          )

          return result
        }

        if (resolved.some((result) => typeof result !== 'undefined')) {
          if (upstreamResult === undefined) {
            // Not attempted yet — ask mockRpcNodeRequest to fetch upstream and retry.
            return undefined
          }

          // `upstreamResult` is `null` (mockRpcNodeRequest's explicit "attempted, nothing usable"
          // signal — a rate-limited or otherwise erroring real RPC, observed as Infura's `-32005
          // Too Many Requests`) or any other non-decodable value. Falling through to `undefined`
          // here (as if upstream were never even tried) previously threw this branch's already-
          // correct slots away along with the genuinely-unresolved ones — discarding, for example,
          // `installSocketVerifier`'s answer for a call that only shared a batch with some *other*
          // mock's still-uncovered selector (see [CS-310]). A real, `allowFailure: true` aggregate3
          // reports exactly this shape for a call that reverted — every caller already handles it —
          // so marking what we can't answer as a clean failure is strictly better than either a raw
          // decode error or one real, rate-limited dependency corrupting the whole batch.
          const upstreamResults =
            typeof upstreamResult === 'string'
              ? (decodeFunctionResult({
                  abi: multicall3Abi,
                  functionName: 'aggregate3',
                  data: upstreamResult as Hex,
                }) as Readonly<Aggregate3Result[]>)
              : undefined

          // A slot we still can't answer (no local resolution, and `upstreamResults` couldn't
          // decode a real per-slot result either — the whole real `aggregate3` call itself errored)
          // can only be safely degraded to a clean `{success: false}` when its own `allowFailure`
          // is `true`. Real Multicall3 semantics revert the *entire* call the instant an
          // `allowFailure: false` call fails — there is no such thing as "just that one slot
          // failed" on-chain for it — so synthesizing a failed-but-otherwise-successful slot here
          // would fabricate a response shape that could never happen for real, and would silently
          // vouch for every *other* slot (including this mock's own already-correct answer) as if
          // the call had genuinely gone through. Bailing out with `undefined` instead lets
          // `fulfillFromUpstream` relay whatever the real upstream actually said for the whole call
          // (a genuine revert, most likely) rather than a fabricated success.
          const hasUnanswerableRequiredCall = resolved.some(
            (returnData, i) =>
              typeof returnData === 'undefined' && !upstreamResults?.[i] && calls[i].allowFailure === false,
          )
          if (hasUnanswerableRequiredCall) {
            return undefined
          }

          return packAggregate3Result(
            resolved.map((returnData, i) =>
              typeof returnData !== 'undefined'
                ? { success: true, returnData: returnData as Hex }
                : (upstreamResults?.[i] ?? { success: false, returnData: '0x' as Hex }),
            ),
          )
        }

        // Matched (contains this mock's own target somewhere) but resolved nothing at all,
        // incidental calls included — e.g. `resolve` itself declined to answer. Nothing more to do
        // locally.
        return undefined
      }

      // A bare, non-batched incidental call (`getEthBalance`/`getCurrentBlockTimestamp`, or
      // something only a *different* mock recognizes — see `resolveNestedCall`) — `isMulticall`
      // above already ruled out an `aggregate3` call.
      return answerIncidentalCall(context, call.to, call.data, getNativeBalance)
    },
    (entry) => matchesSelector(entry, selector, contractAddress),
  )
}

/** Answers the other call shapes this mock recognizes even when they aren't its own target — see
 * `decodeIncidentalCall`'s doc comment for why this exists at all. Falls through to
 * `resolveNestedCall` last, so a call some *other*, unrelated mock owns (batched alongside this
 * one purely by viem's own request batching) gets that mock's answer instead of whatever a real
 * upstream fetch would say for it. */
function answerIncidentalCall(
  context: BrowserContext,
  target: Address,
  callData: Hex,
  getNativeBalance: (address: Address) => bigint | undefined,
): unknown {
  const call = decodeIncidentalCall(callData)

  if (call?.functionName === 'getEthBalance') {
    const [address] = call.args as [Address]
    const balance = getNativeBalance(address) ?? FALLBACK_NATIVE_BALANCE

    return encodeAbiParameters([{ type: 'uint256' }], [balance])
  }

  if (call?.functionName === 'getCurrentBlockTimestamp') {
    return encodeAbiParameters([{ type: 'uint256' }], [BigInt(Math.floor(Date.now() / 1000))])
  }

  return resolveNestedCall(context, target, callData)
}

/**
 * Two Multicall3 functions that can land in the very same `aggregate3` batch as this mock's own
 * call purely by viem's incidental request batching (any `readContract`/`getBalance`/etc. issued on
 * the same tick), regardless of whether they're actually related — so without answering them here
 * too, an otherwise-fully-mocked batch falls into the partial-match branch below and needs a live
 * upstream fetch just to fill one unrelated slot. Matched by decoding against `multicall3Abi` and
 * checking `functionName` (rather than hardcoding each one's selector) so this stays readable.
 */
function decodeIncidentalCall(callData: Hex): { functionName: string; args: readonly unknown[] } | undefined {
  try {
    const decoded = decodeFunctionData({ abi: multicall3Abi, data: callData })
    return decoded.functionName === 'getEthBalance' || decoded.functionName === 'getCurrentBlockTimestamp'
      ? decoded
      : undefined
  } catch {
    return undefined
  }
}

function isMulticall(call: TransactionParams): boolean {
  return call.data.startsWith(AGGREGATE3_SELECTOR)
}

function isTargetCall(
  call: { to?: Address; data?: Hex },
  selector: string,
  contractAddress: string | undefined,
): boolean {
  return (
    Boolean(call.to) &&
    Boolean(call.data) &&
    (call.data as Hex).startsWith(selector) &&
    (contractAddress ? getAddressKey(call.to as Address) === getAddressKey(contractAddress) : true)
  )
}

function matchesNestedInAggregate3(
  call: TransactionParams,
  selector: string,
  contractAddress: string | undefined,
): boolean {
  if (!isMulticall(call)) return false

  try {
    const { args } = decodeFunctionData({ abi: multicall3Abi, data: call.data })
    const calls = args[0] as Readonly<Aggregate3Calls[]>
    return calls.some((c) => isTargetCall({ to: c.target, data: c.callData }, selector, contractAddress))
  } catch {
    return false
  }
}

/**
 * Cheap, upstream-independent check: does `selector` appear anywhere in this call (direct, a bare
 * incidental call — see `decodeIncidentalCall`'s doc comment — or nested in an `aggregate3` batch)?
 * See `mockRpcNodeRequest.ts`'s doc comment on `matches` for why this must not reuse `resolve`'s own
 * undefined-on-"need upstream" return value.
 */
function matchesSelector(entry: JsonRpcEntry, selector: string, contractAddress: string | undefined): boolean {
  const call = entry.params?.[0] as TransactionParams
  if (!call?.to || !call?.data) return false
  if (isTargetCall(call, selector, contractAddress)) return true
  if (decodeIncidentalCall(call.data) !== undefined) return true
  return matchesNestedInAggregate3(call, selector, contractAddress)
}

function packAggregate3Result(result: Readonly<Aggregate3Result[]>): Hex {
  return encodeFunctionResult({ abi: multicall3Abi, functionName: 'aggregate3', result })
}
