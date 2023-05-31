import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import { ParsedQs } from 'qs'

import { changeSwapAmountAnalytics } from 'legacy/components/analytics'
import { FEE_SIZE_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'legacy/constants'
import { useCurrency } from 'legacy/hooks/Tokens'
import useENS from 'legacy/hooks/useENS'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { AppState } from 'legacy/state'
import { useAppDispatch, useAppSelector } from 'legacy/state/hooks'
import { useGetQuoteAndStatus, useQuote } from 'legacy/state/price/hooks'
import { stringToCurrency, useTradeExactInWithFee, useTradeExactOutWithFee } from 'legacy/state/swap/extension'
import TradeGp from 'legacy/state/swap/TradeGp'
import { isWrappingTrade } from 'legacy/state/swap/utils'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from 'legacy/state/user/hooks'
import { registerOnWindow } from 'legacy/utils/misc'

import { useCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useTradeNavigate } from 'modules/trade/hooks/useTradeNavigate'
import { useWalletInfo } from 'modules/wallet'

import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { formatSymbol } from 'utils/format'

import { Field, setRecipient, switchCurrencies, typeInput } from './actions'
import { SwapState } from './reducer'

import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { isAddress } from '../../utils'

export const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
}

export function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

export function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

export function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
export function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

export type Currencies = { [field in Field]?: Currency | null }

export interface SwapActions {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
}

interface DerivedSwapInfo {
  currencies: Currencies
  currenciesIds: { [field in Field]?: string | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  // TODO: remove duplications of the value (v2Trade?.maximumAmountIn(allowedSlippage))
  slippageAdjustedSellAmount: CurrencyAmount<Currency> | null
  inputError?: string
  v2Trade: TradeGp | undefined
  allowedSlippage: Percent
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

  return {
    onSwitchTokens,
    onCurrencySelection,
    onUserInput,
    onChangeRecipient,
  }
}

/**
 * useHighFeeWarning
 * @description checks whether fee vs trade inputAmount = high fee warning
 * @description returns params related to high fee and a cb for checking/unchecking fee acceptance
 * @param trade TradeGp param
 */
export function useHighFeeWarning(trade?: TradeGp) {
  const isExpertMode = useIsExpertMode()
  const { INPUT, OUTPUT, independentField } = useSwapState()

  const [feeWarningAccepted, setFeeWarningAccepted] = useState<boolean>(false) // mod - high fee warning disable state

  // only considers inputAmount vs fee (fee is in input token)
  const [isHighFee, feePercentage] = useMemo(() => {
    if (!trade) return [false, undefined]

    const { inputAmount, fee } = trade
    const feePercentage = fee.feeAsCurrency.divide(inputAmount).asFraction
    return [feePercentage.greaterThan(FEE_SIZE_THRESHOLD), feePercentage.multiply('100')]
  }, [trade])

  // reset the state when users change swap params
  useEffect(() => {
    setFeeWarningAccepted(false)
  }, [INPUT.currencyId, OUTPUT.currencyId, independentField])

  return {
    isHighFee,
    feePercentage,
    // we only care/check about feeWarning being accepted if the fee is actually high..
    feeWarningAccepted: _computeFeeWarningAcceptedState({ feeWarningAccepted, isHighFee, isExpertMode }),
    setFeeWarningAccepted,
  }
}

function _computeFeeWarningAcceptedState({
  feeWarningAccepted,
  isHighFee,
  isExpertMode,
}: {
  feeWarningAccepted: boolean
  isHighFee: boolean
  isExpertMode: boolean
}) {
  // in expert mode there is no fee warning thus it's true
  if (isExpertMode || feeWarningAccepted) return true
  else {
    // not expert mode? is the fee high? that's only when we care
    if (isHighFee) {
      return feeWarningAccepted
    } else {
      return true
    }
  }
}

export function useUnknownImpactWarning(priceImpactParams?: PriceImpact) {
  const isExpertMode = useIsExpertMode()
  const { INPUT, OUTPUT, independentField } = useSwapState()

  const [impactWarningAccepted, setImpactWarningAccepted] = useState<boolean>(false)

  // reset the state when users change swap params
  useEffect(() => {
    setImpactWarningAccepted(false)
  }, [INPUT.currencyId, OUTPUT.currencyId, independentField])

  return {
    impactWarningAccepted: _computeUnknownPriceImpactAcceptedState({
      priceImpactParams,
      impactWarningAccepted,
      isExpertMode,
    }),
    setImpactWarningAccepted,
  }
}

function _computeUnknownPriceImpactAcceptedState({
  impactWarningAccepted,
  priceImpactParams,
  isExpertMode,
}: {
  impactWarningAccepted: boolean
  priceImpactParams?: PriceImpact
  isExpertMode: boolean
}) {
  if (isExpertMode || impactWarningAccepted) return true
  else {
    if (priceImpactParams?.error) {
      return impactWarningAccepted
    }
  }

  return true
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): DerivedSwapInfo {
  const { account, chainId } = useWalletInfo() // MOD: chainId

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useTokenBySymbolOrAddress(inputCurrencyId)
  const outputCurrency = useTokenBySymbolOrAddress(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient ? recipientLookup.address : account) ?? null

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

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

  const currenciesIds: { [field in Field]?: string | null } = useMemo(
    () => ({
      [Field.INPUT]: currencies.INPUT?.isNative ? currencies.INPUT.symbol : currencies.INPUT?.address?.toLowerCase(),
      [Field.OUTPUT]: currencies.OUTPUT?.isNative
        ? currencies.OUTPUT.symbol
        : currencies.OUTPUT?.address?.toLowerCase(),
    }),
    [currencies]
  )

  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  // purely for debugging
  useEffect(() => {
    console.debug('[useDerivedSwapInfo] Price quote: ', quote?.price?.amount)
    console.debug('[useDerivedSwapInfo] Fee quote: ', quote?.fee?.amount)
  }, [quote])

  const isWrapping = isWrappingTrade(inputCurrency, outputCurrency, chainId)

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount: isExactIn ? parsedAmount : undefined,
    outputCurrency,
    quote,
    isWrapping,
  })
  const bestTradeExactOut = useTradeExactOutWithFee({
    parsedAmount: isExactIn ? undefined : parsedAmount,
    inputCurrency,
    quote,
    isWrapping,
  })

  // TODO: rename v2Trade to just "trade" we dont have versions
  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  registerOnWindow({ trade: v2Trade })
  // -- MOD --

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  // TODO: check whether we want to enable auto slippage tolerance
  // const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)  // mod
  // const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance) // mod
  const allowedSlippage = useUserSlippageToleranceWithDefault(INITIAL_ALLOWED_SLIPPAGE_PERCENT) // mod
  const slippageAdjustedSellAmount = v2Trade?.maximumAmountIn(allowedSlippage) || null

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

  return useMemo(
    () => {
      return {
        currencies,
        currenciesIds,
        currencyBalances,
        parsedAmount,
        inputError,
        v2Trade: v2Trade || undefined, // mod
        allowedSlippage,
        slippageAdjustedSellAmount: slippageAdjustedSellAmount,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      allowedSlippage,
      currencyBalances,
      currenciesIds,
      inputError,
      parsedAmount,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(v2Trade),
      slippageAdjustedSellAmount,
    ] // mod
  )
}

export function queryParametersToSwapState(
  parsedQs: ParsedQs,
  defaultInputCurrency = '',
  chainId: number | null
): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)

  if (inputCurrency === '' && outputCurrency === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the wrapped native currency selected
    inputCurrency = defaultInputCurrency // 'ETH' // mod
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    chainId: chainId || null,
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue,
    independentField,
    recipient,
  }
}

export function useIsFeeGreaterThanInput({
  address,
  chainId,
}: {
  address?: string | null
  chainId?: SupportedChainId
}): {
  isFeeGreater: boolean
  fee: CurrencyAmount<Currency> | null
} {
  const quote = useQuote({ chainId, token: address })
  const feeToken = useCurrency(address)

  if (!quote || !feeToken) return { isFeeGreater: false, fee: null }

  return {
    isFeeGreater: quote.error === 'fee-exceeds-sell-amount',
    fee: quote.fee ? stringToCurrency(quote.fee.amount, feeToken) : null,
  }
}
