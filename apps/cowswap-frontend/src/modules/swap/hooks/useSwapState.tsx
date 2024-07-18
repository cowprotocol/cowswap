import { useCallback, useEffect, useMemo, useState } from 'react'

import { useCurrencyAmountBalance } from '@cowprotocol/balances-and-allowances'
import { FEE_SIZE_THRESHOLD } from '@cowprotocol/common-const'
import { formatSymbol, getIsNativeToken, isAddress, tryParseCurrencyAmount } from '@cowprotocol/common-utils'
import { useENS } from '@cowprotocol/ens'
import { useAreThereTokensWithSameSymbol, useTokenBySymbolOrAddress } from '@cowprotocol/tokens'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, TradeType } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'

import { AppState } from 'legacy/state'
import { useAppDispatch, useAppSelector } from 'legacy/state/hooks'
import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'
import { setRecipient, switchCurrencies, typeInput } from 'legacy/state/swap/actions'
import { buildTradeExactInWithFee, buildTradeExactOutWithFee } from 'legacy/state/swap/extension'
import TradeGp from 'legacy/state/swap/TradeGp'
import { isWrappingTrade } from 'legacy/state/swap/utils'
import { Field } from 'legacy/state/types'

import { changeSwapAmountAnalytics, switchTokensAnalytics } from 'modules/analytics'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useVolumeFee } from 'modules/volumeFee'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useSwapSlippage } from './useSwapSlippage'

export const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

export function useSwapState(): AppState['swap'] {
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const state = useAppSelector((state) => state.swap)

  return useMemo(() => {
    return isProviderNetworkUnsupported
      ? { ...state, [Field.INPUT]: { currencyId: undefined }, [Field.OUTPUT]: { currencyId: undefined } }
      : state
  }, [isProviderNetworkUnsupported, state])
}

export type Currencies = { [field in Field]?: Currency | null }

export interface SwapActions {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: Command
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
}

interface DerivedSwapInfo {
  currencies: Currencies
  currenciesIds: { [field in Field]?: string | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  // TODO: remove duplications of the value (trade?.maximumAmountIn(allowedSlippage))
  slippageAdjustedSellAmount: CurrencyAmount<Currency> | null
  slippageAdjustedBuyAmount: CurrencyAmount<Currency> | null
  inputError?: string
  trade: TradeGp | undefined
}

export function useSwapActionHandlers(): SwapActions {
  const { chainId } = useWalletInfo()
  const dispatch = useAppDispatch()
  const onCurrencySelection = useNavigateOnCurrencySelection()
  const navigate = useTradeNavigate()
  const swapState = useSwapState()

  const onSwitchTokens = useCallback(() => {
    const inputCurrencyId = swapState.INPUT.currencyId || null
    const outputCurrencyId = swapState.OUTPUT.currencyId || null

    navigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
    dispatch(switchCurrencies())
    switchTokensAnalytics()
  }, [swapState, navigate, chainId, dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      changeSwapAmountAnalytics(field, Number(typedValue))
      dispatch(typeInput({ field, typedValue }))
    },
    [dispatch]
  )

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      dispatch(setRecipient({ recipient }))
    },
    [dispatch]
  )

  return useMemo(
    () => ({
      onSwitchTokens,
      onCurrencySelection,
      onUserInput,
      onChangeRecipient,
    }),
    [onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient]
  )
}

/**
 * useHighFeeWarning
 * @description checks whether fee vs trade inputAmount = high fee warning
 * @description returns params related to high fee and a cb for checking/unchecking fee acceptance
 * @param trade TradeGp param
 */
export function useHighFeeWarning(trade?: TradeGp) {
  const { INPUT, OUTPUT, independentField } = useSwapState()

  const [feeWarningAccepted, setFeeWarningAccepted] = useState<boolean>(false) // mod - high fee warning disable state

  // only considers inputAmount vs fee (fee is in input token)
  const [isHighFee, feePercentage] = useMemo(() => {
    if (!trade) return [false, undefined]

    const { outputAmountWithoutFee, inputAmountAfterFees, fee, volumeFeeAmount } = trade
    const isExactInput = trade.tradeType === TradeType.EXACT_INPUT
    const feeAsCurrency = isExactInput ? trade.executionPrice.quote(fee.feeAsCurrency) : fee.feeAsCurrency

    const totalFeeAmount = volumeFeeAmount ? feeAsCurrency.add(volumeFeeAmount) : feeAsCurrency
    const targetAmount = isExactInput ? outputAmountWithoutFee : inputAmountAfterFees
    const feePercentage = totalFeeAmount.divide(targetAmount).multiply(100).asFraction

    return [feePercentage.greaterThan(FEE_SIZE_THRESHOLD), feePercentage]
  }, [trade])

  // reset the state when users change swap params
  useEffect(() => {
    setFeeWarningAccepted(false)
  }, [INPUT.currencyId, OUTPUT.currencyId, independentField])

  return useSafeMemo(
    () => ({
      isHighFee,
      feePercentage,
      // we only care/check about feeWarning being accepted if the fee is actually high..
      feeWarningAccepted: _computeFeeWarningAcceptedState({ feeWarningAccepted, isHighFee }),
      setFeeWarningAccepted,
    }),
    [isHighFee, feePercentage, feeWarningAccepted, setFeeWarningAccepted]
  )
}

function _computeFeeWarningAcceptedState({
  feeWarningAccepted,
  isHighFee,
}: {
  feeWarningAccepted: boolean
  isHighFee: boolean
}) {
  if (feeWarningAccepted) return true
  else {
    // is the fee high? that's only when we care
    if (isHighFee) {
      return feeWarningAccepted
    } else {
      return true
    }
  }
}

export function useUnknownImpactWarning() {
  const { INPUT, OUTPUT, independentField } = useSwapState()

  const [impactWarningAccepted, setImpactWarningAccepted] = useState<boolean>(false)

  // reset the state when users change swap params
  useEffect(() => {
    setImpactWarningAccepted(false)
  }, [INPUT.currencyId, OUTPUT.currencyId, independentField])

  return useMemo(
    () => ({
      impactWarningAccepted,
      setImpactWarningAccepted,
    }),
    [impactWarningAccepted, setImpactWarningAccepted]
  )
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): DerivedSwapInfo {
  const { account, chainId } = useWalletInfo()
  const slippage = useSwapSlippage()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()
  const checkTokensWithSameSymbol = useAreThereTokensWithSameSymbol()

  const inputCurrencyIsDoubled = checkTokensWithSameSymbol(inputCurrencyId)
  const outputCurrencyIsDoubled = checkTokensWithSameSymbol(outputCurrencyId)

  const inputCurrency = useTokenBySymbolOrAddress(inputCurrencyIsDoubled ? null : inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(outputCurrencyIsDoubled ? null : outputCurrencyId)

  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient ? recipientLookup.address : account) ?? null

  const inputCurrencyBalance = useCurrencyAmountBalance(inputCurrency)
  const outputCurrencyBalance = useCurrencyAmountBalance(outputCurrency)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  )

  // TODO: be careful! For native tokens we use symbol instead of address
  const currenciesIds: { [field in Field]?: string | null } = useMemo(
    () => ({
      [Field.INPUT]:
        currencies.INPUT && getIsNativeToken(currencies.INPUT)
          ? currencies.INPUT.symbol
          : currencies.INPUT?.address?.toLowerCase(),
      [Field.OUTPUT]:
        currencies.OUTPUT && getIsNativeToken(currencies.OUTPUT)
          ? currencies.OUTPUT.symbol
          : currencies.OUTPUT?.address?.toLowerCase(),
    }),
    [currencies]
  )

  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const isWrapping = isWrappingTrade(inputCurrency, outputCurrency, chainId)

  const volumeFee = useVolumeFee()

  const trade = useSafeMemo(() => {
    if (isWrapping) return undefined

    if (isExactIn) {
      return buildTradeExactInWithFee({
        parsedAmount,
        outputCurrency,
        quote,
        volumeFee,
      })
    }

    return buildTradeExactOutWithFee({
      parsedAmount,
      inputCurrency,
      quote,
      volumeFee,
    })
  }, [isExactIn, parsedAmount, inputCurrency, outputCurrency, quote, volumeFee, isWrapping])

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: inputCurrencyBalance,
      [Field.OUTPUT]: outputCurrencyBalance,
    }),
    [inputCurrencyBalance, outputCurrencyBalance]
  )

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const slippageAdjustedSellAmount = trade?.maximumAmountIn(slippage) || null
  const slippageAdjustedBuyAmount = trade?.minimumAmountOut(slippage) || null

  const inputError = useMemo(() => {
    let inputError: string | undefined

    if (!account) {
      inputError = t`Connect Wallet`
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? t`Select a token`
    }

    if (!parsedAmount) {
      inputError = inputError ?? t`Enter an amount`
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? t`Enter a valid recipient`
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? t`Invalid recipient`
      }
    }

    // compare input balance to max input based on version
    // const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)] // mod
    const balanceIn = currencyBalances[Field.INPUT]
    const amountIn = slippageAdjustedSellAmount

    // Balance not loaded - fix for https://github.com/cowprotocol/cowswap/issues/451
    if (!balanceIn && inputCurrency) {
      inputError = t`Couldn't load balances`
    }

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = t`Insufficient ${formatSymbol(amountIn.currency.symbol)} balance`
    }

    return inputError
  }, [account, slippageAdjustedSellAmount, currencies, currencyBalances, inputCurrency, parsedAmount, to]) // mod

  return useMemo(() => {
    return {
      currencies,
      currenciesIds,
      currencyBalances,
      parsedAmount,
      inputError,
      trade,
      slippageAdjustedSellAmount,
      slippageAdjustedBuyAmount,
    }
  }, [
    currencies,
    trade,
    currencyBalances,
    currenciesIds,
    inputError,
    parsedAmount,
    slippageAdjustedSellAmount,
    slippageAdjustedBuyAmount,
  ])
}
