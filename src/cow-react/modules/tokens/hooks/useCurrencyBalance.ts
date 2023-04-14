// TODO: Most of the hooks in this file are legacy and should be adapted and re-rexported from the token module

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { useMemo } from 'react'
import { useSingleContractMultipleData } from 'lib/hooks/multicall'

import { isAddress } from 'utils'
import { nativeOnChain } from 'constants/tokens'
import { useInterfaceMulticall } from 'hooks/useContract'

import { useWalletInfo } from '@cow/modules/wallet'
import { useOnchainBalances } from '@cow/modules/tokens'
import { TokenAmounts } from '@cow/modules/tokens'

// TODO: Move this hooks to some other module. It doens't belong with the tokens
/**
 * Returns a map of the given addresses to their eventually consistent ETH balances.
 */
export function useNativeCurrencyBalances(uncheckedAddresses?: (string | undefined)[]): {
  [address: string]: CurrencyAmount<Currency> | undefined
} {
  const { chainId } = useWalletInfo()
  const multicallContract = useInterfaceMulticall()

  const validAddressInputs: [string][] = useMemo(
    () =>
      uncheckedAddresses
        ? uncheckedAddresses
            .map(isAddress)
            .filter((a): a is string => a !== false)
            .sort()
            .map((addr) => [addr])
        : [],
    [uncheckedAddresses]
  )

  const results = useSingleContractMultipleData(multicallContract, 'getEthBalance', validAddressInputs)

  return useMemo(
    () =>
      validAddressInputs.reduce<{ [address: string]: CurrencyAmount<Currency> }>((memo, [address], i) => {
        const value = results?.[i]?.result?.[0]
        if (value && chainId)
          memo[address] = CurrencyAmount.fromRawAmount(nativeOnChain(chainId), JSBI.BigInt(value.toString()))
        return memo
      }, {}),
    [validAddressInputs, chainId, results]
  )
}

// get the balance for a single token/account combo
/**
 * @deprecated Use effective balance instead
 */
export function useTokenBalance(account?: string, token?: Token): CurrencyAmount<Token> | undefined {
  const tokens = useMemo(() => [token], [token])
  const tokenBalances = useOnchainBalances({
    account,
    tokens,
  })
  if (!token) return undefined

  return tokenBalances.amounts[token.address]?.value
}

// get the balance for a single token/account combo
/**
 * @deprecated Use effective balance instead
 */
export function useTokenBalances(account?: string, tokens?: (Token | undefined)[]): TokenAmounts {
  return useOnchainBalances({ account, tokens }).amounts
}

/**
 * @deprecated Use effective balance instead
 */
export function useCurrencyBalances(
  account?: string,
  currencies?: (Currency | undefined | null)[]
): (CurrencyAmount<Currency> | undefined)[] {
  const tokens = useMemo(
    () => currencies?.filter((currency): currency is Token => currency?.isToken ?? false) ?? [],
    [currencies]
  )

  const tokenBalances = useTokenBalances(account, tokens)
  const containsETH: boolean = useMemo(() => currencies?.some((currency) => currency?.isNative) ?? false, [currencies])
  const ethBalance = useNativeCurrencyBalances(useMemo(() => (containsETH ? [account] : []), [containsETH, account]))

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!account || !currency) return undefined
        if (currency.isToken) return tokenBalances[currency.address]?.value
        if (currency.isNative) return ethBalance[account]
        return undefined
      }) ?? [],
    [account, currencies, ethBalance, tokenBalances]
  )
}

/**
 * @deprecated Use effective balance instead
 */
export default function useCurrencyBalance(
  account?: string,
  currency?: Currency | null
): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(
    account,
    useMemo(() => [currency], [currency])
  )[0]
}
