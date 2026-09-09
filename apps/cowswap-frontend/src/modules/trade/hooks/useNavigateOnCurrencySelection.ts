import { useCallback, useRef } from 'react'

import { LpToken } from '@cowprotocol/common-const'
import { getCurrencyAddress, getIsNativeToken } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { useAreThereTokensWithSameSymbol, useDoesSymbolResolveToToken } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBridgeSupportedNetworks } from 'entities/bridgeProvider'

import { Field } from 'legacy/state/types'

import { useTradeNavigate, TradeSearchParams } from 'common/modules/tradeNavigation'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

export type CurrencySelectionCallback = (
  field: Field,
  currency: Currency | null,
  stateUpdateCallback?: StateUpdateCallback,
  searchParams?: TradeSearchParams,
) => void

export type StateUpdateCallback = (nextState: Partial<ExtendedTradeRawState>) => void

/**
 * To avoid collisions of tokens with the same symbols we use a token address instead of token symbol
 * if there are more than one token with the same symbol
 * @see useResetStateWithSymbolDuplication.ts
 */
// eslint-disable-next-line max-lines-per-function,complexity
export function useNavigateOnCurrencySelection(enableSellEqBuy = false): CurrencySelectionCallback {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency, orderKind } = useDerivedTradeState() || {}
  const { state: tradeRawState } = useTradeState()
  const navigate = useTradeNavigate()
  const { data: bridgeSupportedNetworks } = useBridgeSupportedNetworks()
  const resolveCurrencyAddressOrSymbol = useResolveCurrencyAddressOrSymbol()

  const isOutputCurrencyBridgeSupported = Boolean(
    outputCurrency ? bridgeSupportedNetworks?.some((network) => network.id === outputCurrency?.chainId) : true,
  )

  /**
   * Last-resort, sticky fallback for whichever side (input/output) the user *isn't* currently
   * picking a new currency for — read via `.current` at click time, not captured in the callback's
   * closure, so it stays correct even if this specific render's `inputCurrency`/`outputCurrency`
   * (from `useDerivedTradeState()`) or `tradeRawState` (via `useTradeState()`, which can itself
   * momentarily read as empty — see its `EMPTY_TRADE_STATE` short-circuit) are transiently
   * unavailable right when the click fires. Without this, selecting a currency for one side while
   * the other transiently reads as unresolved wipes that other, already-selected side to the `_`
   * "unset" URL placeholder (`parameterizeTradeRoute`) instead of preserving it — observed as
   * [CS-104]'s flaky sell token reverting to "Select a token" after picking the buy token.
   */
  const lastKnownInputCurrencyIdRef = useRef<string | null>(null)
  const lastKnownOutputCurrencyIdRef = useRef<string | null>(null)

  const knownInputCurrencyId =
    (inputCurrency && resolveCurrencyAddressOrSymbol(inputCurrency)) ?? tradeRawState?.inputCurrencyId ?? null
  const knownOutputCurrencyId =
    (outputCurrency && resolveCurrencyAddressOrSymbol(outputCurrency)) ?? tradeRawState?.outputCurrencyId ?? null

  if (knownInputCurrencyId) lastKnownInputCurrencyIdRef.current = knownInputCurrencyId
  if (knownOutputCurrencyId) lastKnownOutputCurrencyIdRef.current = knownOutputCurrencyId

  return useCallback(
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (
      field: Field,
      currency: Currency | null,
      stateUpdateCallback?: StateUpdateCallback,
      searchParams?: TradeSearchParams,
    ) => {
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

      // The preserved (non-bridge-aware) side just reads the sticky ref — it's already updated on
      // every render with this exact `(currency && resolve(currency)) ?? tradeRawState?....id`
      // fallback chain, so it's always at least as fresh as recomputing it here.
      const inputCurrencyId = lastKnownInputCurrencyIdRef.current
      const outputCurrencyId = outputCurrency
        ? // For cross-chain order always use address for outputCurrencyId
          isBridgeTrade || targetChainMismatch
          ? getCurrencyAddress(outputCurrency)
          : resolveCurrencyAddressOrSymbol(outputCurrency)
        : lastKnownOutputCurrencyIdRef.current

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

      if (!isOutputCurrencyBridgeSupported) delete searchParams?.targetChainId
      if (shouldResetBuyOrder) searchParams = { ...searchParams, kind: OrderKind.SELL, amount: '1' }

      const currencyIds =
        areCurrenciesTheSame && !enableSellEqBuy
          ? { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId }
          : {
              inputCurrencyId: targetInputCurrencyId,
              outputCurrencyId: isBridgeTrade && !isOutputCurrencyBridgeSupported ? null : targetOutputCurrencyId,
            }
      const nextChainId = isInputField ? targetChainId : chainId

      // Apply next state to callback so caller can merge amount and update once (avoids glitch from URL sync effect applying currencies in a second render).
      stateUpdateCallback?.({
        chainId: nextChainId ?? null,
        ...currencyIds,
        targetChainId: searchParams?.targetChainId ?? null,
      })

      navigate(nextChainId, currencyIds, searchParams)
    },
    [
      navigate,
      chainId,
      orderKind,
      inputCurrency,
      outputCurrency,
      isOutputCurrencyBridgeSupported,
      resolveCurrencyAddressOrSymbol,
      enableSellEqBuy,
    ],
  )
}

function useResolveCurrencyAddressOrSymbol(): (currency: Currency | null) => string | null {
  const areThereTokensWithSameSymbol = useAreThereTokensWithSameSymbol()
  const doesSymbolResolveToToken = useDoesSymbolResolveToToken()

  return useCallback(
    (currency: Currency | null): string | null => {
      if (!currency) return null

      if (currency instanceof LpToken) return (currency as Token).address

      const symbol = currency.symbol || null

      // Native currencies are modelled as tokens with a fixed 0xeee... address, which is not a usable URL id
      if (getIsNativeToken(currency)) return symbol

      const { address, chainId } = currency as Token

      // Prefer the address when the symbol is ambiguous, and also when it does not resolve back to this
      // exact token: a token that is not active yet, or whose address is active under a different
      // symbol, is unreachable by symbol and would re-trigger the import prompt forever.
      const isSymbolUsable =
        !areThereTokensWithSameSymbol(symbol, chainId) && doesSymbolResolveToToken(symbol, address, chainId)

      return isSymbolUsable ? symbol : address
    },
    [areThereTokensWithSameSymbol, doesSymbolResolveToToken],
  )
}
