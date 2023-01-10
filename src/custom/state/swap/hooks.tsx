// eslint-disable-next-line no-restricted-imports
import { t } from '@lingui/macro'
import { Currency, CurrencyAmount, NativeCurrency, Percent, Token /* TradeType, */ } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'
// import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
// import { useBestTrade } from 'hooks/useBestTrade'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state/hooks'
// import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from 'state/user/hooks'

// import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import useENS from 'hooks/useENS'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { isAddress } from 'utils'
import { useCurrencyBalances } from 'state/connection/hooks'
// import { AppState } from '../index'
import { Field, replaceSwapState, setRecipient, switchCurrencies, typeInput } from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'
import { changeSwapAmountAnalytics } from 'components/analytics'

// MOD
import { BAD_RECIPIENT_ADDRESSES } from '@src/state/swap/hooks'
import { useGetQuoteAndStatus, useQuote } from '../price/hooks'
import { registerOnWindow } from 'utils/misc'
import { useTradeExactInWithFee, useTradeExactOutWithFee, stringToCurrency } from './extension'
import { FEE_SIZE_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE_PERCENT } from 'constants/index'
import TradeGp from './TradeGp'

import { SupportedChainId, SupportedChainId as ChainId } from 'constants/chains'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'

import { isWrappingTrade } from './utils'

import {
  parseCurrencyFromURLParameter,
  parseTokenAmountURLParameter,
  parseIndependentFieldURLParameter,
  validatedRecipient,
} from '@src/state/swap/hooks'
import { PriceImpact } from 'hooks/usePriceImpact'
import { supportedChainId } from 'utils/supportedChainId'
import { AppState } from 'state'
import { useTokenBySymbolOrAddress } from '@cow/common/hooks/useTokenBySymbolOrAddress'
import { useOnCurrencySelection } from '@cow/modules/trade/hooks/useOnCurrencySelection'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'

export * from '@src/state/swap/hooks'

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
  inputError?: string
  v2Trade: TradeGp | undefined
  allowedSlippage: Percent
}

export function useSwapActionHandlers(): SwapActions {
  const { chainId } = useWeb3React()
  const dispatch = useAppDispatch()
  const onCurrencySelection = useOnCurrencySelection()
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
  const { account, chainId } = useWeb3React() // MOD: chainId

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
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

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
      inputError = inputError ?? t`Enter a recipient`
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? t`Invalid recipient`
      }
    }

    // compare input balance to max input based on version
    // const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)] // mod
    const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], v2Trade?.maximumAmountIn(allowedSlippage)] // mod

    // Balance not loaded - fix for https://github.com/cowprotocol/cowswap/issues/451
    if (!balanceIn && inputCurrency) {
      inputError = t`Couldn't load balances`
    }

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = t`Insufficient ${amountIn.currency.symbol} balance`
    }

    return inputError
  }, [account, allowedSlippage, currencies, currencyBalances, inputCurrency, parsedAmount, to, v2Trade]) // mod

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
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allowedSlippage, currencyBalances, currenciesIds, inputError, parsedAmount, JSON.stringify(v2Trade)] // mod
  )
}

/* export function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
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
} */

// mod: defaultInputCurrency parameters
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

// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(): SwapState {
  const { chainId: _chainId } = useWeb3React()
  const chainId = supportedChainId(_chainId)
  const dispatch = useAppDispatch()
  const parsedQs = useParsedQueryString()

  // TODO: check whether we can use the new function for native currency
  // This is not a great fix for setting a default token
  // but it is better and easiest considering updating default files
  const defaultInputToken = WETH[chainId || SupportedChainId.MAINNET].address // mod

  const parsedSwapState = useMemo(() => {
    return queryParametersToSwapState(parsedQs, defaultInputToken, chainId || null) // mod
  }, [defaultInputToken, parsedQs, chainId]) // mod

  useEffect(() => {
    if (!chainId) return
    const inputCurrencyId = parsedSwapState[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsedSwapState[Field.OUTPUT].currencyId ?? undefined

    dispatch(
      replaceSwapState({
        chainId,
        typedValue: parsedSwapState.typedValue,
        independentField: parsedSwapState.independentField,
        inputCurrencyId,
        outputCurrencyId,
        recipient: parsedSwapState.recipient,
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, chainId])

  return parsedSwapState
}

// MODS
export function useReplaceSwapState() {
  const dispatch = useAppDispatch()
  return useCallback(
    (newState: {
      chainId: number | null
      independentField: Field
      typedValue: string
      inputCurrencyId?: string | undefined
      outputCurrencyId?: string | undefined
      recipient: string | null
    }) => dispatch(replaceSwapState(newState)),
    [dispatch]
  )
}

export interface NativeCurrenciesInfo {
  isNativeIn: boolean
  isNativeOut: boolean
  isWrappedIn: boolean
  isWrappedOut: boolean
  wrappedToken: Token & { logoURI: string }
  native: NativeCurrency
}

export function useIsFeeGreaterThanInput({ address, chainId }: { address?: string | null; chainId?: ChainId }): {
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
