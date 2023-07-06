import { useMemo } from 'react'

import { Erc20Interface, Erc20Abi } from '@cowprotocol/abis'
import { Interface } from '@ethersproject/abi'
import { ListenerOptionsWithGas } from '@uniswap/redux-multicall'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

import { isAddress } from 'legacy/utils'

import { useMultipleContractSingleData } from 'lib/hooks/multicall'

import { BalancesAndAllowances, BalancesAndAllowancesParams, TokenAmounts, TokenAmountsResult } from '../types'

const ERC20Interface = new Interface(Erc20Abi) as Erc20Interface
const DEFAULT_LISTENER_OPTIONS: ListenerOptionsWithGas = { gasRequired: 185_000, blocksPerFetch: 5 }

export interface OnchainAmountsParams {
  account?: string
  tokens?: (Token | undefined)[]
  blocksPerFetch?: number
}

export type OnchainBalancesParams = OnchainAmountsParams

export type OnchainAllowancesParams = OnchainAmountsParams & { spender?: string }

export function useOnchainBalances(params: OnchainBalancesParams): TokenAmountsResult {
  const { account } = params
  const callParams = useMemo(() => [account], [account])
  return useOnchainErc20Amounts('balanceOf', callParams, params)
}

export function useOnchainAllowances(params: OnchainAllowancesParams): TokenAmountsResult {
  const { account, spender } = params
  const callParams = useMemo(() => [account, spender], [account, spender])
  return useOnchainErc20Amounts('allowance', callParams, params)
}

/**
 * Fetches
 * @param params
 * @returns
 */
export function useOnchainBalancesAndAllowances(params: BalancesAndAllowancesParams): BalancesAndAllowances {
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
): TokenAmountsResult {
  const { account, blocksPerFetch, tokens } = params

  const validatedTokens: Token[] = useMemo(
    () => tokens?.filter((t?: Token): t is Token => isAddress(t?.address) !== false) ?? [],
    [tokens]
  )
  const validatedTokenAddresses = useMemo(() => validatedTokens.map((vt) => vt.address), [validatedTokens])

  // Do on-chain calls
  const balancesCallState = useMultipleContractSingleData(
    validatedTokenAddresses,
    ERC20Interface,
    erc20Method,
    callParams,
    blocksPerFetch ? { ...DEFAULT_LISTENER_OPTIONS, blocksPerFetch } : DEFAULT_LISTENER_OPTIONS
  )

  const isLoading: boolean = useMemo(
    () => balancesCallState.some((callState) => callState.loading),
    [balancesCallState]
  )

  // Return amounts
  return useMemo(() => {
    if (!account || validatedTokens.length === 0 || balancesCallState.length === 0) {
      return { isLoading, amounts: {} }
    }

    const tokenBalances = validatedTokens.reduce<TokenAmounts>((acc, token, i) => {
      const { error, loading, result, syncing, valid } = balancesCallState[i]
      const value = result?.[0]
      const amount = value ? JSBI.BigInt(value.toString()) : null

      acc[token.address] = {
        value: amount ? CurrencyAmount.fromRawAmount(token, amount) : acc[token.address]?.value,
        loading,
        error,
        syncing,
        valid,
      }
      return acc
    }, {})

    return { amounts: tokenBalances, isLoading }
  }, [account, validatedTokens, balancesCallState, isLoading])
}
