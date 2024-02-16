import { useCallback } from 'react'

import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Token } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { TradeSearchParams } from '../utils/parameterizeTradeSearch'

export type CurrencySelectionCallback = (
  field: Field,
  currency: Currency | null,
  stateUpdateCallback?: Command,
  searchParams?: TradeSearchParams
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
export function useNavigateOnCurrencySelection(): CurrencySelectionCallback {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const navigate = useTradeNavigate()
  const resolveCurrencyAddressOrSymbol = useResolveCurrencyAddressOrSymbol()

  return useCallback(
    (field: Field, currency: Currency | null, stateUpdateCallback?: Command, searchParams?: TradeSearchParams) => {
      if (!state) return

      const { inputCurrencyId, outputCurrencyId } = state
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      const targetInputCurrencyId = field === Field.INPUT ? tokenSymbolOrAddress : inputCurrencyId
      const targetOutputCurrencyId = field === Field.INPUT ? outputCurrencyId : tokenSymbolOrAddress
      const areCurrenciesTheSame = targetInputCurrencyId === targetOutputCurrencyId

      navigate(
        chainId,
        // Just invert tokens when user selected the same token
        areCurrenciesTheSame
          ? { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId }
          : {
              inputCurrencyId: targetInputCurrencyId,
              outputCurrencyId: targetOutputCurrencyId,
            },
        searchParams
      )

      stateUpdateCallback?.()
    },
    [navigate, chainId, state, resolveCurrencyAddressOrSymbol]
  )
}
