import { Multicall3, Multicall3Abi } from '@cowprotocol/abis'
import type { Web3Provider } from '@ethersproject/providers'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { Contract } from '@ethersproject/contracts'

const multicallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11'

const DEFAULT_BATCH_SIZE = 200

export interface MulticallTokensParams {
  tokens: TokenWithLogo[]
  callData: string
  provider: Web3Provider
  mapper?: (value: string, token: TokenWithLogo) => unknown
  batchSize?: number
}

/**
 * TODO: add backOffs, fallbacks, etc
 */
export async function multicallTokens<T = string>(params: MulticallTokensParams): Promise<{ [address: string]: T }> {
  const { tokens, callData, provider, mapper, batchSize = DEFAULT_BATCH_SIZE } = params

  const multicall = new Contract(multicallAddress, Multicall3Abi, provider) as Multicall3

  const batches = tokens.reduce<TokenWithLogo[][]>((acc, token, index) => {
    const batchIndex = Math.floor(index / batchSize)

    if (!acc[batchIndex]) acc[batchIndex] = []

    acc[batchIndex].push(token)
    return acc
  }, [])

  const calls = batches.map((batch) => batchToCalls(batch, callData))

  const requests = calls.map((batch) => {
    return multicall.callStatic.tryAggregate(false, batch)
  })

  return await Promise.all(requests).then((results) => {
    return batches.reduce<{ [key: string]: T }>((acc, batch, batchIndex) => {
      batch.forEach((token, i) => {
        const value = results[batchIndex][i].returnData

        acc[token.address.toLowerCase()] = (mapper ? mapper(value, token) : value) as T
      })

      return acc
    }, {})
  })
}

function batchToCalls(tokens: TokenWithLogo[], callData: string): Multicall3.CallStruct[] {
  return tokens.map<Multicall3.CallStruct>((token) => {
    return {
      target: token.address,
      callData,
    }
  })
}
