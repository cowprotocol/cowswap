import { Interface } from '@ethersproject/abi'
import { isAddress } from '@src/utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import ERC20ABI from 'abis/erc20.json'
import { Erc20Interface } from 'abis/types/Erc20'
import { useMultipleContractSingleData } from 'lib/hooks/multicall'

import { useMemo } from 'react'

const ERC20Interface = new Interface(ERC20ABI) as Erc20Interface
const tokenBalancesGasRequirement = { gasRequired: 185_000 }

export interface TokenBalance {
  value: CurrencyAmount<Token> | null
  loading: boolean
  syncing: boolean
  error: boolean
  valid: boolean
}
export type GetOnchainBalanceResult = { [tokenAddress: string]: TokenBalance }

/**
 * Return the on-chain balance for a given account and list of tokens
 * @param account
 * @param tokens
 * @returns
 */
export function useGetOnchainBalances(account?: string, tokens?: (Token | undefined)[]): GetOnchainBalanceResult {
  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )
  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  // Do on-chain calls
  const balancesCallState = useMultipleContractSingleData(
    validatedTokenAddresses,
    ERC20Interface,
    'balanceOf',
    useMemo(() => [account], [account]),
    tokenBalancesGasRequirement
  )

  // Return balance data
  return useMemo(() => {
    if (!account || validatedTokens.length === 0) {
      return {}
    }

    const tokenBalances = validatedTokens.reduce<GetOnchainBalanceResult>((acc, token, i) => {
      const { error, loading, result, syncing, valid } = balancesCallState[i]
      const value = result?.[0]
      const amount = value ? JSBI.BigInt(value.toString()) : null

      acc[token.address] = {
        value: amount ? CurrencyAmount.fromRawAmount(token, amount) : acc[token.address].value,
        loading,
        error,
        syncing,
        valid,
      }
      return acc
    }, {})

    return tokenBalances
  }, [account, validatedTokens, balancesCallState])
}
