/* eslint-disable complexity */
/* eslint-disable @nx/enforce-module-boundaries */

import { defaultAbiCoder } from '@ethersproject/abi'
import type { BytesLike } from '@ethersproject/bytes'
import type { JsonRpcProvider } from '@ethersproject/providers'

// @cowprotocol/multicall takes long time to bundle, so import getMulticallContract directly
import { getMulticallContract } from '../../../../../libs/multicall/src/utils/getMulticallContract'
import { injected } from '../../support/ethereum'

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

  function getOriginalResult(): Promise<BytesLike> {
    if (callback) {
      return new Promise((resolve) => {
        send({ method, params }, resolve)
      })
    }
    return send(...args)
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
  returnData: string,
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
      const multicall = getMulticallContract(ethereum.provider as JsonRpcProvider)
      const functionData = multicall.interface.decodeFunctionData('tryAggregate', params?.[0]?.data)
      const calls = functionData.calls as { callData: string; target: string }[]

      const indexes = calls.flatMap((x, idx) => {
        if (x.target.toLowerCase() === to.toLowerCase() && x.callData.startsWith(dataMethod)) {
          return [idx]
        }
        return []
      })

      const result = await getOriginalResult()

      const [decoded] = structuredClone(defaultAbiCoder.decode(['tuple(bool success, bytes returnData)[]'], result))

      indexes.forEach((idx) => {
        const item = decoded[idx]
        if (!item) return
        item[1] = item.returnData = returnData
      })

      return returnResult(multicall.interface.encodeFunctionResult('tryAggregate', [decoded]))
    }

    return undefined
  }
}

export function handleTokenBalance(ethereum: typeof injected, tokenAddress: string, value: bigint): MockMiddleware {
  return handleAddressEthCall(ethereum, tokenAddress, '0x70a08231', defaultAbiCoder.encode(['uint256'], [value]))
}

export function handleTokenAllowance(ethereum: typeof injected, tokenAddress: string, value: bigint): MockMiddleware {
  return handleAddressEthCall(ethereum, tokenAddress, '0xdd62ed3e', defaultAbiCoder.encode(['uint256'], [value]))
}

function handleNativeBalanceCall(ethereum: typeof injected, owner: string, returnData: string): MockMiddleware {
  const send = ethereum.send.bind(ethereum)

  return async (...args) => {
    const { method, params, returnResult } = parseSendArgs(send, ...args)

    if (method === 'eth_getBalance' && params?.[0]?.toLowerCase() === owner.toLowerCase()) {
      return returnResult(returnData)
    }

    // 0x4d2301cc - multicall3 getEthBalance
    if (method === 'eth_call' && params?.[0]?.data?.startsWith('0x4d2301cc')) {
      const multicall = getMulticallContract(ethereum.provider as JsonRpcProvider)
      const functionData = multicall.interface.decodeFunctionData('getEthBalance', params?.[0]?.data)
      const addr = functionData.addr as string

      if (addr.toLowerCase() === owner.toLowerCase()) {
        return returnResult(multicall.interface.encodeFunctionResult('getEthBalance', [returnData]))
      }
    }

    return undefined
  }
}

export function handleNativeBalance(ethereum: typeof injected, owner: string, value: bigint): MockMiddleware {
  return handleNativeBalanceCall(ethereum, owner, defaultAbiCoder.encode(['uint256'], [value]))
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
