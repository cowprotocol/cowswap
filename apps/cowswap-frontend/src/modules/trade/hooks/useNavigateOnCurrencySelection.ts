import { useCallback } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Token } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { getDefaultCurrencies } from '../types'
import { TradeSearchParams } from '../utils/parameterizeTradeSearch'

export type CurrencySelectionCallback = (
  field: Field,
  currency: Currency | null,
  stateUpdateCallback?: Command,
  searchParams?: TradeSearchParams,
) => void

function useResolveCurrencyAddressOrSymbol(): (currency: Currency | null) => string | null {
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()

  return useCallback(
    (currency: Currency | null): string | null => {
      if (!currency) return null

      return currency instanceof LpToken || areThereTokensWithSameSymbol(currency.symbol, currency.chainId)
        ? (currency as Token).address
        : currency.symbol || null
    },
    [areThereTokensWithSameSymbol],
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
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (field: Field, currency: Currency | null, stateUpdateCallback?: Command, searchParams?: TradeSearchParams) => {
      if (!state) return

      const { inputCurrencyId, outputCurrencyId, orderKind } = state
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      /**
       * Change network to the token network only when select a sell token
       * Because we allow to sell only tokens from supported networks
       */
      const targetChainId = currency?.chainId || chainId
      const targetChainMismatch = targetChainId !== chainId
      const isInputField = field === Field.INPUT

      const targetInputCurrencyId = isInputField ? tokenSymbolOrAddress : inputCurrencyId

      const targetOutputCurrencyId = isInputField
        ? outputCurrencyId
        : targetChainMismatch && currency
          ? getCurrencyAddress(currency)
          : tokenSymbolOrAddress

      const areCurrenciesTheSame = targetInputCurrencyId === targetOutputCurrencyId

      /**
       * If selected sell token doesn't match current network
       * It means that it was selected from another chain, and we are switching network
       * So, we should reset the buy token corresponding to the new network
       */
      const shouldResetBuyToken = isInputField && targetChainMismatch
      const shouldSetTargetChain = !isInputField && targetChainMismatch
      const shouldResetBuyOrder = !isInputField && targetChainMismatch && orderKind === OrderKind.BUY

      const defaultOutputCurrency = getDefaultCurrencies(targetChainId).outputCurrency

      /**
       * Keep the target chain id in the search params when input token changed
       */
      if (isInputField && state.targetChainId) {
        searchParams = { ...searchParams, targetChainId: state.targetChainId }
      }

      if (shouldSetTargetChain) {
        searchParams = { ...searchParams, targetChainId: targetChainId }
      }

      /**
       * Buy orders are not allowed in bridging mode
       * Because of that, we reset order kind and amount to defaults
       */
      if (shouldResetBuyOrder) {
        searchParams = { ...searchParams, kind: OrderKind.SELL, amount: '1' }
      }

      navigate(
        isInputField ? targetChainId : chainId,
        // Just invert tokens when user selected the same token
        areCurrenciesTheSame
          ? { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId }
          : {
              inputCurrencyId: targetInputCurrencyId,
              outputCurrencyId: shouldResetBuyToken ? defaultOutputCurrency?.address || null : targetOutputCurrencyId,
            },
        searchParams,
      )

      stateUpdateCallback?.()
    },
    [navigate, chainId, state, resolveCurrencyAddressOrSymbol],
  )
}
