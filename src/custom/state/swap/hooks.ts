import { t } from '@lingui/macro'
// import JSBI from 'jsbi'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
// import { useBestV3TradeExactIn, useBestV3TradeExactOut, V3TradeState } from '../../hooks/useBestV3Trade'
import useENS from 'hooks/useENS'
// import { parseUnits } from '@ethersproject/units'
import { Currency, CurrencyAmount, Percent, Token /* TradeType, */ } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
import { ParsedQs } from 'qs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from 'hooks/web3'
import { useCurrency } from 'hooks/Tokens'
// import useSwapSlippageTolerance from '../../hooks/useSwapSlippageTolerance'
// import { Version } from 'hooks/useToggledVersion'
// import { useV2TradeExactIn, useV2TradeExactOut } from 'hooks/useV2Trade'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { isAddress } from 'utils'
// import { AppState } from 'state'
import { useCurrencyBalances } from 'state/wallet/hooks'
import {
  Field,
  replaceSwapState /* , selectCurrency, setRecipient, switchCurrencies, typeInput */,
} from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'
// import { useUserSingleHopOnly } from 'state/user/hooks'
import { useAppDispatch /* , useAppSelector */ } from 'state/hooks'

// MOD
import { tryParseAmount, useSwapState } from 'state/swap/hooks'
import { useGetQuoteAndStatus, useQuote } from '../price/hooks'
import { registerOnWindow } from 'utils/misc'
import { useTradeExactInWithFee, useTradeExactOutWithFee, stringToCurrency } from './extension'
import { /* DEFAULT_LIST_OF_LISTS, */ DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { FEE_SIZE_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE_PERCENT, WETH_LOGO_URI, XDAI_LOGO_URI } from 'constants/index'
import TradeGp from './TradeGp'

import { SupportedChainId as ChainId } from 'constants/chains'
import { WETH9_EXTENDED as WETH, GpEther as ETHER } from 'constants/tokens'

import { BAD_RECIPIENT_ADDRESSES } from 'state/swap/hooks'
import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '@src/state/user/hooks'

export * from '@src/state/swap/hooks'

interface DerivedSwapInfo {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: string
  v2Trade: TradeGp | undefined
  toggledTrade: TradeGp | null
  allowedSlippage: Percent
}

/* export function useSwapActionHandlers(): {
  onCurrencySelection: (field: Field, currency: Currency) => void
  onSwitchTokens: () => void
  onUserInput: (field: Field, typedValue: string) => void
  onChangeRecipient: (recipient: string | null) => void
} {
  const dispatch = useAppDispatch()
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      dispatch(
        selectCurrency({
          field,
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : ''
        })
      )
    },
    [dispatch]
  )

  const onSwitchTokens = useCallback(() => {
    dispatch(switchCurrencies())
  }, [dispatch])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
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
    onChangeRecipient
  }
} */

// try to parse a user entered amount for a given token
/* export function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
} */

/* const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true // v2 router 02
} */

/**
 * Returns true if any of the pairs or tokens in a trade have the given checksummed address
 * @param trade to check for the given address
 * @param checksummedAddress address to check in the pairs and tokens
 */
/* function involvesAddress(
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>,
  checksummedAddress: string
): boolean {
  const path = trade instanceof V2Trade ? trade.route.path : trade.route.tokenPath
  return (
    path.some(token => token.address === checksummedAddress) ||
    (trade instanceof V2Trade
      ? trade.route.pairs.some(pair => pair.liquidityToken.address === checksummedAddress)
      : false)
  )
} */

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

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): /* {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: string
  v2Trade: V2Trade<Currency, Currency, TradeType> | undefined
  v3TradeState: { trade: V3Trade<Currency, Currency, TradeType> | null; state: V3TradeState }
  toggledTrade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  allowedSlippage: Percent
} */ DerivedSwapInfo {
  const { account, chainId } = useActiveWeb3React()

  // const [singleHopOnly] = useUserSingleHopOnly()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient,
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined,
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  /* const bestV2TradeExactIn = useV2TradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, {
    maxHops: singleHopOnly ? 1 : undefined
  })
  const bestV2TradeExactOut = useV2TradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, {
    maxHops: singleHopOnly ? 1 : undefined */

  /* const bestV3TradeExactIn = useBestV3TradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined)
  const bestV3TradeExactOut = useBestV3TradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined)

  const v2Trade = isExactIn ? bestV2TradeExactIn : bestV2TradeExactOut
  const v3Trade = (isExactIn ? bestV3TradeExactIn : bestV3TradeExactOut) ?? undefined */

  const { quote } = useGetQuoteAndStatus({
    token: inputCurrencyId,
    chainId,
  })

  // purely for debugging
  useEffect(() => {
    console.debug('[useDerivedSwapInfo] Price quote: ', quote?.price?.amount)
    console.debug('[useDerivedSwapInfo] Fee quote: ', quote?.fee?.amount)
  }, [quote])

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount: isExactIn ? parsedAmount : undefined,
    outputCurrency,
    quote,
  })
  const bestTradeExactOut = useTradeExactOutWithFee({
    parsedAmount: isExactIn ? undefined : parsedAmount,
    inputCurrency,
    quote,
  })

  // TODO: rename v2Trade to just "trade" we dont have versions
  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  registerOnWindow({ trade: v2Trade })

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1],
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined,
  }

  let inputError: string | undefined
  if (!account) {
    inputError = t`Connect Wallet`
  }

  if (!parsedAmount) {
    inputError = inputError ?? t`Enter an amount`
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? t`Select a token`
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? t`Enter a recipient`
  } else {
    if (
      BAD_RECIPIENT_ADDRESSES[formattedTo]
      // TODO: review if we need this:
      /*
      (bestV2TradeExactIn && involvesAddress(bestV2TradeExactIn, formattedTo)) ||
      (bestV2TradeExactOut && involvesAddress(bestV2TradeExactOut, formattedTo)) */
    ) {
      inputError = inputError ?? t`Invalid recipient`
    }
  }

  // TODO: we don't use toggled Trades
  const toggledTrade = v2Trade /* (toggledVersion === Version.v2 ? v2Trade : v3Trade.trade) ?? undefined */
  // const allowedSlippage = useSwapSlippageTolerance(toggledTrade)

  const allowedSlippage = useUserSlippageToleranceWithDefault(INITIAL_ALLOWED_SLIPPAGE_PERCENT)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], v2Trade?.maximumAmountIn(allowedSlippage)]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = t`Insufficient ${amountIn.currency.symbol} balance`
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    inputError,
    v2Trade: v2Trade ?? undefined,
    // v3TradeState: v3Trade,
    toggledTrade,
    allowedSlippage,
  }
}

export function parseCurrencyFromURLParameter(urlParam: any): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    if (urlParam.toUpperCase() === 'ETH') return 'ETH'
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

export function queryParametersToSwapState(parsedQs: ParsedQs, defaultInputCurrency = ''): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === '' && outputCurrency === '') {
    // default to ETH input
    inputCurrency = defaultInputCurrency
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency,
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient,
  }
}

type DefaultFromUrlSearch = { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
// updates the swap state to use the defaults for a given network
export function useDefaultsFromURLSearch(): DefaultFromUrlSearch {
  const { chainId } = useActiveWeb3React()
  const replaceSwapState = useReplaceSwapState()
  const parsedQs = useParsedQueryString()
  const [result, setResult] = useState<DefaultFromUrlSearch>()

  useEffect(() => {
    if (!chainId) return
    // This is not a great fix for setting a default token
    // but it is better and easiest considering updating default files
    const defaultInputToken = WETH[chainId].address
    const parsed = queryParametersToSwapState(parsedQs, defaultInputToken)
    const inputCurrencyId = parsed[Field.INPUT].currencyId ?? undefined
    const outputCurrencyId = parsed[Field.OUTPUT].currencyId ?? undefined

    replaceSwapState({
      typedValue: parsed.typedValue,
      field: parsed.independentField,
      inputCurrencyId,
      outputCurrencyId,
      recipient: parsed.recipient,
    })

    setResult({ inputCurrencyId, outputCurrencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  return result
}

// MODS
export function useReplaceSwapState() {
  const dispatch = useAppDispatch()
  return useCallback(
    (newState: {
      field: Field
      typedValue: string
      inputCurrencyId?: string | undefined
      outputCurrencyId?: string | undefined
      recipient: string | null
    }) => dispatch(replaceSwapState(newState)),
    [dispatch]
  )
}

interface CurrencyWithAddress {
  currency?: Currency
  address?: string | null
}

export function useDetectNativeToken(input?: CurrencyWithAddress, output?: CurrencyWithAddress, chainId?: ChainId) {
  return useMemo(() => {
    const wrappedToken: Token & { logoURI: string } = Object.assign(
      WETH[chainId || DEFAULT_NETWORK_FOR_LISTS].wrapped,
      {
        logoURI: chainId === ChainId.XDAI ? XDAI_LOGO_URI : WETH_LOGO_URI,
      }
    )

    const native = ETHER.onChain(chainId || DEFAULT_NETWORK_FOR_LISTS)

    const [isNativeIn, isNativeOut] = [input?.currency?.isNative, output?.currency?.isNative]
    const [isWrappedIn, isWrappedOut] = [input?.currency?.equals(wrappedToken), output?.currency?.equals(wrappedToken)]

    return {
      isNativeIn: isNativeIn && !isWrappedOut,
      isNativeOut: isNativeOut && !isWrappedIn,
      isWrappedIn,
      isWrappedOut,
      wrappedToken,
      native,
    }
  }, [input, output, chainId])
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
