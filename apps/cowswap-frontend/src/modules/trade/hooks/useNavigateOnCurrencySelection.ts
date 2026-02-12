import { useCallback } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useAreThereTokensWithSameSymbol } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, Token } from '@uniswap/sdk-core'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeNavigate } from './useTradeNavigate'

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
  const { inputCurrency, outputCurrency, orderKind } = useDerivedTradeState() || {}
  const navigate = useTradeNavigate()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const resolveCurrencyAddressOrSymbol = useResolveCurrencyAddressOrSymbol()

  const isOutputCurrencyBridgeSupported = Boolean(
    outputCurrency ? bridgeSupportedNetworks?.some((network) => network.id === outputCurrency?.chainId) : true,
  )

  return useCallback(
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (field: Field, currency: Currency | null, stateUpdateCallback?: Command, searchParams?: TradeSearchParams) => {
      const tokenSymbolOrAddress = resolveCurrencyAddressOrSymbol(currency)

      /**
       * Change network to the token network only when select a sell token
       * Because we allow to sell only tokens from supported networks
       */
      const targetChainId = currency?.chainId || chainId
      const targetChainMismatch = targetChainId !== chainId
      const isInputField = field === Field.INPUT

      const targetInputCurrency = isInputField ? currency : inputCurrency
      const targetOutputCurrency = isInputField ? outputCurrency : currency

      const isBridgeTrade = getAreBridgeCurrencies(targetInputCurrency, targetOutputCurrency)

      const inputCurrencyId = (inputCurrency && resolveCurrencyAddressOrSymbol(inputCurrency)) ?? null
      const outputCurrencyId = outputCurrency
        ? // For cross-chain order always use address for outputCurrencyId
          isBridgeTrade || targetChainMismatch
          ? getCurrencyAddress(outputCurrency)
          : resolveCurrencyAddressOrSymbol(outputCurrency)
        : null

      // When switching SELL chain, persist token address for non-native tokens.
      // Symbols from imported/non-canonical lists may not resolve reliably from URL (e.g. A3A).
      const targetInputCurrencyId = isInputField
        ? targetChainMismatch && currency instanceof Token
          ? currency.address
          : tokenSymbolOrAddress
        : inputCurrencyId
      const targetOutputCurrencyId = isInputField
        ? outputCurrencyId
        : targetChainMismatch && currency
          ? getCurrencyAddress(currency)
          : tokenSymbolOrAddress

      const areCurrenciesTheSame =
        targetInputCurrency && targetOutputCurrency && targetInputCurrency.equals(targetOutputCurrency)

      const shouldResetBuyOrder = targetChainMismatch && orderKind === OrderKind.BUY

      // When sell and buy tokens are on different chains
      if (isBridgeTrade) {
        searchParams = {
          ...searchParams,
          targetChainId: isInputField
            ? outputCurrency?.chainId // When sell token is changed, then set output token chainId as targetChainId
            : currency?.chainId, // When buy token is changed, then set the selected token chainid  as targetChainId
        }
      }

      if (!isOutputCurrencyBridgeSupported) {
        delete searchParams?.targetChainId
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
              outputCurrencyId: isBridgeTrade
                ? isOutputCurrencyBridgeSupported
                  ? targetOutputCurrencyId
                  : null
                : targetOutputCurrencyId,
            },
        searchParams,
      )

      stateUpdateCallback?.()
    },
    [
      navigate,
      chainId,
      orderKind,
      inputCurrency,
      outputCurrency,
      isOutputCurrencyBridgeSupported,
      resolveCurrencyAddressOrSymbol,
    ],
  )
}
