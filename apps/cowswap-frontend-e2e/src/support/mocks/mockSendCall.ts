/* eslint-disable complexity */

import {
  decodeAbiParameters,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionResult,
  Hex,
  parseAbiItem,
} from 'viem'

import { injected } from '../../support/ethereum'

// Multicall3 ABI fragments
const TRY_AGGREGATE_ABI = [
  parseAbiItem(
    'function tryAggregate(bool requireSuccess, (address target, bytes callData)[] calls) returns ((bool success, bytes returnData)[])',
  ),
]
const GET_ETH_BALANCE_ABI = [parseAbiItem('function getEthBalance(address addr) view returns (uint256 balance)')]

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
function parseSendArgs(send: typeof injected.send, ...args: any[]) {
  const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function'
  let callback: Function | undefined
  let method: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let params: any[] | undefined
  if (isCallbackForm) {
    callback = args[1]
    method = args[0].method
    params = args[0].params
  } else {
    method = args[0]
    params = args[1]
  }

  function getOriginalResult(): Promise<Hex> {
    if (callback) {
      return new Promise((resolve) => {
        send({ method, params }, resolve)
      })
    }
    return send(...args) as Promise<Hex>
  }

  function returnResult(value: unknown): Promise<unknown> | void {
    if (callback) {
      callback(value)
      return
    }
    return Promise.resolve(value)
  }

  return {
    method,
    params,
    getOriginalResult,
    returnResult,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MockMiddleware = (...args: any[]) => Promise<unknown>

function handleAddressEthCall(
  ethereum: typeof injected,
  to: string,
  dataMethod: string,
  returnData: Hex,
): MockMiddleware {
  const send = ethereum.send.bind(ethereum)

  return async (...args) => {
    const { getOriginalResult, method, params, returnResult } = parseSendArgs(send, ...args)
    if (
      method === 'eth_call' &&
      params?.[0]?.to?.toLowerCase() === to.toLowerCase() &&
      params?.[0]?.data?.startsWith(dataMethod) // 0x70a08231 - balance // 0xdd62ed3e - allowance
    ) {
      return returnResult(returnData)
    }

    // 0xbce38bd7 - multicall3 tryAggregate
    if (method === 'eth_call' && params?.[0]?.data?.startsWith('0xbce38bd7')) {
      const functionData = decodeFunctionData({
        abi: TRY_AGGREGATE_ABI,
        data: params?.[0]?.data as Hex,
      })
      const calls = functionData.args[1]

      const indexes = calls.flatMap((x, idx) => {
        if (x.target.toLowerCase() === to.toLowerCase() && x.callData.startsWith(dataMethod)) {
          return [idx]
        }
        return []
      })

      const result = await getOriginalResult()

      const [decoded] = decodeAbiParameters(
        [{ type: 'tuple(bool success, bytes returnData)[]', name: 'results' }],
        result,
      ) as [readonly { success: boolean; returnData: Hex }[]]

      const mutableDecoded = decoded.map((item) => ({ success: item.success, returnData: item.returnData }))

      indexes.forEach((idx) => {
        const item = mutableDecoded[idx]
        if (!item) return
        item.returnData = returnData
      })

      return returnResult(
        encodeFunctionResult({
          abi: TRY_AGGREGATE_ABI,
          functionName: 'tryAggregate',
          result: mutableDecoded.map((item) => ({ success: item.success, returnData: item.returnData })),
        }),
      )
    }

    return undefined
  }
}

export function handleTokenBalance(ethereum: typeof injected, tokenAddress: string, value: bigint): MockMiddleware {
  return handleAddressEthCall(ethereum, tokenAddress, '0x70a08231', encodeAbiParameters([{ type: 'uint256' }], [value]))
}

export function handleTokenAllowance(ethereum: typeof injected, tokenAddress: string, value: bigint): MockMiddleware {
  return handleAddressEthCall(ethereum, tokenAddress, '0xdd62ed3e', encodeAbiParameters([{ type: 'uint256' }], [value]))
}

function handleNativeBalanceCall(ethereum: typeof injected, owner: string, returnData: Hex): MockMiddleware {
  const send = ethereum.send.bind(ethereum)

  return async (...args) => {
    const { method, params, returnResult } = parseSendArgs(send, ...args)

    if (method === 'eth_getBalance' && params?.[0]?.toLowerCase() === owner.toLowerCase()) {
      return returnResult(returnData)
    }

    // 0x4d2301cc - multicall3 getEthBalance
    if (method === 'eth_call' && params?.[0]?.data?.startsWith('0x4d2301cc')) {
      const { args } = decodeFunctionData({
        abi: GET_ETH_BALANCE_ABI,
        data: params?.[0]?.data as Hex,
      })
      const addr = args[0]

      if (addr.toLowerCase() === owner.toLowerCase()) {
        return returnResult(
          encodeFunctionResult({
            abi: GET_ETH_BALANCE_ABI,
            functionName: 'getEthBalance',
            result: BigInt(returnData),
          }),
        )
      }
    }

    return undefined
  }
}

export function handleNativeBalance(ethereum: typeof injected, owner: string, value: bigint): MockMiddleware {
  return handleNativeBalanceCall(ethereum, owner, encodeAbiParameters([{ type: 'uint256' }], [value]))
}

export function mockSendCall(ethereum: typeof injected, middlewares: MockMiddleware[]): void {
  const send = ethereum.send.bind(ethereum)

  cy.stub(ethereum, 'send').callsFake(async (...args) => {
    for (const middleware of middlewares) {
      const handledResult = await middleware(...args)
      if (typeof handledResult === 'undefined') continue
      return handledResult
    }
    return send(...args)
  })
}
