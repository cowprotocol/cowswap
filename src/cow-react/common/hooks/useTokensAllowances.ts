import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'
import { Interface } from '@ethersproject/abi'
import ERC20ABI from 'abis/erc20.json'
import { Erc20Interface } from 'abis/types/Erc20'
import JSBI from 'jsbi'

const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface

export type Allowances = { [key: string]: CurrencyAmount<Token> | undefined }

export interface TokensAllowancesResult {
  allowances: Allowances
  isLoading: boolean
}

export function useTokensAllowances(
  account: string | undefined,
  spender: string | undefined,
  tokens: Token[]
): TokensAllowancesResult {
  const tokensAddresses = useMemo(() => tokens.map((token) => token.address), [tokens])

  const allowancesRequests = useMultipleContractSingleData(
    tokensAddresses,
    ERC20Interface,
    'allowance',
    useMemo(() => [account, spender], [account, spender])
  )

  const isLoading = useMemo(() => allowancesRequests.some((callState) => callState.loading), [allowancesRequests])

  return useMemo(() => {
    if (!account) return { allowances: {}, isLoading }

    const allowances = tokensAddresses.reduce((acc, tokenAddress, i) => {
      const allowance = allowancesRequests?.[i].result?.[0]
      const token = tokens[i]

      acc[tokenAddress] = allowance ? CurrencyAmount.fromRawAmount(token, JSBI.BigInt(allowance.toString())) : undefined

      return acc
    }, {} as Allowances)

    return { allowances, isLoading }
  }, [tokens, account, tokensAddresses, isLoading, allowancesRequests])
}
