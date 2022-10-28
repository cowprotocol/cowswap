import { useCallback } from 'react'
import { Field } from 'state/swap/actions'
import { useWeb3React } from '@web3-react/core'
import { Currency, Token } from '@uniswap/sdk-core'
import { useAreThereTokensWithSameSymbol } from '@cow/modules/limitOrders/hooks/useAreThereTokensWithSameSymbol'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useLimitOrdersNavigate } from '@cow/modules/limitOrders/hooks/useLimitOrdersNavigate'

function useResolveCurrencyAddressOrSymbol(): (currency: Currency | null) => string | null {
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()

  return useCallback(
    (currency: Currency | null): string | null => {
      if (!currency) return null

      return areThereTokensWithSameSymbol(currency.symbol) ? (currency as Token).address : currency.symbol || null
    },
    [areThereTokensWithSameSymbol]
  )
}

/**
 * To avoid collisions of tokens with the same symbols we use a token address instead of token symbol
 * if there are more than one token with the same symbol
 * @see useResetStateWithSymbolDuplication.ts
 */
export function useOnCurrencySelection(): (field: Field, currency: Currency) => void {
  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const limitOrdersNavigate = useLimitOrdersNavigate()
  const resolveCurrencyAddressOrSymbol = useResolveCurrencyAddressOrSymbol()

  return useCallback(
    (field: Field, currency: Currency) => {
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      if (field === Field.INPUT) {
        limitOrdersNavigate(chainId, tokenSymbolOrAddress, resolveCurrencyAddressOrSymbol(outputCurrency))
      } else {
        limitOrdersNavigate(chainId, resolveCurrencyAddressOrSymbol(inputCurrency), tokenSymbolOrAddress)
      }
    },
    [limitOrdersNavigate, chainId, inputCurrency, outputCurrency, resolveCurrencyAddressOrSymbol]
  )
}
