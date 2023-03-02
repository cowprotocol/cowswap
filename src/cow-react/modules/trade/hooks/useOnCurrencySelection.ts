import { useCallback } from 'react'
import { Field } from 'state/swap/actions'
import { useWeb3React } from '@web3-react/core'
import { Currency, Token } from '@uniswap/sdk-core'
import { useAreThereTokensWithSameSymbol } from '@cow/common/hooks/useAreThereTokensWithSameSymbol'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { useTradeState } from '@cow/modules/trade/hooks/useTradeState'

export type CurrencySelectionCallback = (
  field: Field,
  currency: Currency | null,
  stateUpdateCallback?: () => void
) => void

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
export function useOnCurrencySelection(): CurrencySelectionCallback {
  const { chainId } = useWeb3React()
  const tradeState = useTradeState()
  const navigate = useTradeNavigate()
  const resolveCurrencyAddressOrSymbol = useResolveCurrencyAddressOrSymbol()

  return useCallback(
    (field: Field, currency: Currency | null, stateUpdateCallback?: () => void) => {
      if (!tradeState) return

      const { inputCurrencyId, outputCurrencyId } = tradeState.state
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      if (field === Field.INPUT) {
        navigate(chainId, {
          inputCurrencyId: tokenSymbolOrAddress,
          outputCurrencyId,
        })
      } else {
        navigate(chainId, {
          inputCurrencyId,
          outputCurrencyId: tokenSymbolOrAddress,
        })
      }

      stateUpdateCallback?.()
    },
    [navigate, chainId, tradeState, resolveCurrencyAddressOrSymbol]
  )
}
