import { Address, decodeFunctionData, decodeFunctionResult, encodeFunctionResult, Hex, multicall3Abi } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { mockRpcNodeRequest, type JsonRpcEntry, type TransactionParams } from './mockRpcNodeRequest'

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
  resolve: (callData: Hex, target: Address, requestUrl: string) => unknown,
): void {
  const isTarget = (call: { to?: Address; data?: Hex }): boolean => isTargetCall(call, selector, contractAddress)

  mockRpcNodeRequest(
    context,
    'eth_call',
    // eslint-disable-next-line complexity
    (entry, upstreamResult, requestUrl) => {
      const call = entry.params?.[0] as TransactionParams
      if (!call?.to || !call?.data || !call.to) {
        return undefined
      }

      if (isTarget(call)) {
        // Direct smart-contract call
        const result = resolve(call.data, call.to, requestUrl ?? '')

        return result
      }

      // Multicall
      if (isMulticall(call)) {
        const { functionName, args } = decodeFunctionData({
          abi: multicall3Abi,
          data: call.data,
        })

        if (functionName === 'aggregate3') {
          const calls: Readonly<Aggregate3Calls[]> = args[0]

          const resolved = calls.map((call) =>
            isTarget({ to: call.target, data: call.callData })
              ? resolve(call.callData, call.target, requestUrl ?? '')
              : undefined,
          )

          if (resolved.every((result) => typeof result !== 'undefined')) {
            // All calls are matching
            const result = packAggregate3Result(
              resolved.map((returnData) => ({ success: true, returnData: returnData as Hex })),
            )

            return result
          }

          if (resolved.some((result) => typeof result !== 'undefined')) {
            if (typeof upstreamResult !== 'string') {
              // No real result to fall back on yet — ask mockRpcNodeRequest to fetch upstream and retry.
              return undefined
            }

            const upstreamResults = decodeFunctionResult({
              abi: multicall3Abi,
              functionName: 'aggregate3',
              data: upstreamResult as Hex,
            }) as Readonly<Aggregate3Result[]>

            return packAggregate3Result(
              resolved.map((returnData, i) =>
                typeof returnData === 'undefined'
                  ? upstreamResults[i]
                  : { success: true, returnData: returnData as Hex },
              ),
            )
          }
        }

        if (functionName === 'getEthBalance') {
          // TODO: wire up balances mocks here
          return undefined
        }

        if (functionName === 'getCurrentBlockTimestamp') {
          return undefined
        }
      }

      return undefined
    },
    (entry) => matchesSelector(entry, selector, contractAddress),
  )
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

/**
 * Cheap, upstream-independent check: does `selector` appear anywhere in this call (direct or
 * nested in an `aggregate3` batch)? See `mockRpcNodeRequest.ts`'s doc comment on `matches` for why
 * this must not reuse `resolve`'s own undefined-on-"need upstream" return value.
 */
function matchesSelector(entry: JsonRpcEntry, selector: string, contractAddress: string | undefined): boolean {
  const call = entry.params?.[0] as TransactionParams
  if (!call?.to || !call?.data) return false
  if (isTargetCall(call, selector, contractAddress)) return true
  if (!isMulticall(call)) return false

  try {
    const { functionName, args } = decodeFunctionData({ abi: multicall3Abi, data: call.data })
    if (functionName !== 'aggregate3') return false
    const calls: Readonly<Aggregate3Calls[]> = args[0]
    return calls.some((c) => isTargetCall({ to: c.target, data: c.callData }, selector, contractAddress))
  } catch {
    return false
  }
}

function packAggregate3Result(result: Readonly<Aggregate3Result[]>): Hex {
  return encodeFunctionResult({ abi: multicall3Abi, functionName: 'aggregate3', result })
}
