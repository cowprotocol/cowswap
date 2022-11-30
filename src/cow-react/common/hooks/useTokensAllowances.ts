import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { Interface } from '@ethersproject/abi'
import ERC20ABI from 'abis/erc20.json'
import { Erc20Interface } from 'abis/types/Erc20'
import JSBI from 'jsbi'
import { ListenerOptions } from '@uniswap/redux-multicall'

const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface

export type Allowances = { [key: string]: CurrencyAmount<Token> | undefined }

export interface TokensAllowancesResult {
  allowances: Allowances
  isLoading: boolean
}

// TODO: add calls batching (max 100 requests per batch for example)
export function useTokensAllowances(
  account: string | undefined,
  spender: string | undefined,
  tokens: Token[],
  listenerOptions?: ListenerOptions
): TokensAllowancesResult {
  const tokensAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])

  const allowancesRequests = useMultipleContractSingleData(
    tokensAddresses,
    ERC20Interface,
    'allowance',
    useMemo(() => [account, spender], [account, spender]),
    listenerOptions
  )

  const isLoading = useMemo(() => allowancesRequests.some((callState) => callState.loading), [allowancesRequests])

  const allowances = useMemo(() => {
    return tokensAddresses.reduce((acc, tokenAddress, i) => {
      const allowance = allowancesRequests?.[i]?.result?.[0]
      const token = tokens[i]

      acc[tokenAddress] = allowance ? CurrencyAmount.fromRawAmount(token, JSBI.BigInt(allowance.toString())) : undefined

      return acc
    }, {} as Allowances)
  }, [tokensAddresses, allowancesRequests, tokens])

  return useMemo(() => {
    if (!account) return { allowances: {}, isLoading: false }

    return { allowances, isLoading }
  }, [account, allowances, isLoading])
}
