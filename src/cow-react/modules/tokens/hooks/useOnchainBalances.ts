import { Interface, AbiCoder } from '@ethersproject/abi'
import { isAddress } from '@src/utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import ERC20ABI from 'abis/erc20.json'
import { Erc20Interface } from 'abis/types/Erc20'
import { useEffect, useMemo, useState } from 'react'
import { OnchainState } from '../types'
import { MultiCallService, AbiItem, ProviderConnector, SolStructType } from '@1inch/multicall'

const abiCoder = new AbiCoder()
const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface

class MultiCallConnector implements ProviderConnector {
  contractEncodeABI(abi: AbiItem[], address: string | null, methodName: string, methodParams: unknown[]): string {
    return new Interface(abi).encodeFunctionData(methodName as any, methodParams as any)
  }

  decodeABIParameter<T>(type: string | SolStructType, hex: string): T {
    return this.decodeABIParameterList<any>([type] as any, hex)[0] as T
  }

  // Copy-paste from 'web3-eth-abi', I guess we should have smth similar in '@ethersproject/abi'
  decodeABIParameterList<T>(type: string[] | SolStructType[], hex: string): T {
    var result = abiCoder.decode(type as any, hex)
    var returnValues = {} as any
    var decodedValue
    if (Array.isArray(result)) {
      if (type.length > 1) {
        type.forEach(function (output, i) {
          decodedValue = result[i]
          if (decodedValue === '0x') {
            decodedValue = null
          }
          returnValues[i] = decodedValue
          if (typeof output === 'object' && output.name) {
            returnValues[output.name] = decodedValue
          }
        })
        return returnValues
      }
      return result as T
    }
    if (typeof type[0] === 'object' && type[0].name) {
      returnValues[type[0].name] = result
    }
    returnValues[0] = result
    return returnValues
  }

  ethCall(contractAddress: string, callData: string, blockNumber?: string): Promise<string> {
    const params = [{ to: contractAddress, data: callData }, blockNumber || 'latest']

    return (window.ethereum as any).request({
      method: 'eth_call',
      params,
    })
  }
}

const multiCallConnector = new MultiCallConnector()

const multiCallService = new MultiCallService(multiCallConnector, '0x8d035edd8e09c3283463dade67cc0d49d6868063')

const multicallParams = {
  chunkSize: 100,
  retriesLimit: 3,
  blockNumber: 'latest',
}

export type OnchainTokenAmount = OnchainState<CurrencyAmount<Token> | undefined>

export type OnchainTokenAmounts = {
  [tokenAddress: string]: OnchainTokenAmount
}

export type OnchainAmountsResult = {
  amounts: OnchainTokenAmounts
  isLoading: boolean
}

export interface OnchainAmountsParams {
  account?: string
  tokens?: (Token | undefined)[]
  blocksPerFetch?: number
}

export type OnchainBalancesParams = OnchainAmountsParams

export type OnchainAllowancesParams = OnchainAmountsParams & { spender?: string }

export function useOnchainBalances(params: OnchainBalancesParams): OnchainAmountsResult {
  const { account } = params
  const callParams = useMemo(() => [account], [account])
  return useOnchainErc20Amounts('balanceOf', callParams, params)
}

export function useOnchainAllowances(params: OnchainAllowancesParams): OnchainAmountsResult {
  const { account, spender } = params
  const callParams = useMemo(() => [account, spender], [account, spender])
  return useOnchainErc20Amounts('allowance', callParams, params)
}

export interface OnchainBalancesAndAllowancesParams {
  account: string | undefined
  spender: string | undefined
  tokens: Token[]
  blocksPerFetchBalance?: number
  blocksPerFetchAllowance?: number
}

export interface OnchainBalancesAndAllowances {
  balances: OnchainTokenAmounts
  allowances: OnchainTokenAmounts
  isLoading: boolean
}

/**
 * Fetches
 * @param params
 * @returns
 */
export function useOnchainBalancesAndAllowances(
  params: OnchainBalancesAndAllowancesParams
): OnchainBalancesAndAllowances {
  const { account, spender, tokens, blocksPerFetchAllowance, blocksPerFetchBalance } = params

  const { amounts: balances, isLoading: areBalancesLoading } = useOnchainBalances({
    account,
    tokens,
    blocksPerFetch: blocksPerFetchBalance,
  })
  const { amounts: allowances, isLoading: areAllowancesLoading } = useOnchainAllowances({
    account,
    tokens,
    spender,
    blocksPerFetch: blocksPerFetchAllowance,
  })

  return useMemo(
    () => ({
      balances,
      allowances,
      isLoading: areBalancesLoading || areAllowancesLoading,
    }),
    [balances, allowances, areBalancesLoading, areAllowancesLoading]
  )
}

function useOnchainErc20Amounts(
  erc20Method: 'balanceOf' | 'allowance',
  callParams: (string | undefined)[],
  params: OnchainAmountsParams
): OnchainAmountsResult {
  const { account, tokens } = params
  const [results, setResults] = useState<string[] | null>(null)

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )
  const data = useMemo(() => {
    const validatedParams = callParams.filter((p) => typeof p !== 'undefined')

    if (!validatedParams.length) return []

    return validatedTokens.map((vt) => {
      return {
        to: vt.address,
        data: ERC20Interface.encodeFunctionData(erc20Method as any, validatedParams as any),
      }
    })
  }, [validatedTokens, erc20Method, callParams])

  useEffect(() => {
    if (!data.length) return

    // Pure call
    multiCallService.callByChunks(data, multicallParams).then((res) => {
      setResults(res)
    })
  }, [JSON.stringify(data)])

  const isLoading: boolean = results === null

  // Return amounts
  return useMemo(() => {
    if (!account || !results) {
      return { isLoading, amounts: {} }
    }

    const tokenBalances = validatedTokens.reduce<OnchainTokenAmounts>((acc, token, i) => {
      const value = results[i]
      const amount = value ? JSBI.BigInt(value.toString()) : null

      acc[token.address] = {
        value: amount ? CurrencyAmount.fromRawAmount(token, amount) : acc[token.address]?.value,
        loading: false,
        error: false,
        syncing: false,
        valid: true,
      }
      return acc
    }, {})

    return { amounts: tokenBalances, isLoading }
  }, [account, validatedTokens, results, isLoading])
}
