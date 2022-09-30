import { useCallback } from 'react'
import { Field } from 'state/swap/actions'
import { useWeb3React } from '@web3-react/core'
import { Currency, Token } from '@uniswap/sdk-core'
import { useAreThereTokensWithSameSymbol } from 'cow-react/modules/limitOrders/hooks/useAreThereTokensWithSameSymbol'
import { useLimitOrdersStateManager } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useLimitOrdersTradeState } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersTradeState'

/**
 * To avoid collisions of tokens with the same symbols we use a token address instead of token symbol
 * if there are more than one token with the same symbol
 * @see useResetStateWithSymbolDuplication.ts
 */
export function useOnCurrencySelection(): (field: Field, currency: Currency) => void {
  const { chainId } = useWeb3React()
  const stateManager = useLimitOrdersStateManager()
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()

  const resolveCurrencyAddressOrSymbol = useCallback(
    (currency: Currency | null): string | null => {
      if (!currency) return null

      return areThereTokensWithSameSymbol(currency.symbol) ? (currency as Token).address : currency.symbol || null
    },
    [areThereTokensWithSameSymbol]
  )

  return useCallback(
    (field: Field, currency: Currency) => {
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      if (field === Field.INPUT) {
        stateManager.navigate(chainId, tokenSymbolOrAddress, resolveCurrencyAddressOrSymbol(outputCurrency))
      } else {
        stateManager.navigate(chainId, resolveCurrencyAddressOrSymbol(inputCurrency), tokenSymbolOrAddress)
      }
    },
    [stateManager, chainId, inputCurrency, outputCurrency, resolveCurrencyAddressOrSymbol]
  )
}
