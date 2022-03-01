import { Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, Token /* TradeType, */ } from '@uniswap/sdk-core'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useBestTrade } from 'hooks/useBestTrade'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { ParsedQs } from 'qs'
import { ReactNode, useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch /* , useAppSelector */ } from 'state/hooks'
import { InterfaceTrade, TradeState } from 'state/routing/types'
import { useUserSlippageToleranceWithDefault } from 'state/user/hooks'

import { TOKEN_SHORTHANDS } from '../../constants/tokens'
import { useCurrency } from 'hooks/Tokens'
import useENS from 'hooks/useENS'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { isAddress } from 'utils'
import { AppState } from 'state'
import { useCurrencyBalances } from 'state/wallet/hooks'
import {
  Field,
  replaceSwapState /* , selectCurrency, setRecipient, switchCurrencies, typeInput */,
} from 'state/swap/actions'
import { SwapState } from 'state/swap/reducer'

// MOD
import { tryParseAmount, useSwapState, BAD_RECIPIENT_ADDRESSES } from '@src/state/swap/hooks'
import { useGetQuoteAndStatus, useQuote } from '../price/hooks'
import { registerOnWindow } from 'utils/misc'
import { useTradeExactInWithFee, useTradeExactOutWithFee, stringToCurrency } from './extension'
import { /* DEFAULT_LIST_OF_LISTS, */ DEFAULT_NETWORK_FOR_LISTS } from 'constants/lists'
import { FEE_SIZE_THRESHOLD, INITIAL_ALLOWED_SLIPPAGE_PERCENT, WETH_LOGO_URI, XDAI_LOGO_URI } from 'constants/index'
import TradeGp from './TradeGp'

import { SupportedChainId as ChainId } from 'constants/chains'
import { WETH9_EXTENDED as WETH, GpEther as ETHER } from 'constants/tokens'

import { useIsExpertMode, useUserSlippageToleranceWithDefault } from '@src/state/user/hooks'
import { PriceImpact } from 'hooks/usePriceImpact'
import { isWrappingTrade } from './utils'

export * from '@src/state/swap/hooks'

export function useSwapState(): AppState['swap'] {
  return useAppSelector((state) => state.swap)
}

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
          currencyId: currency.isToken ? currency.address : currency.isNative ? 'ETH' : '',
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
    onChangeRecipient,
  }
} */

/* const BAD_RECIPIENT_ADDRESSES: { [address: string]: true } = {
  '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f': true, // v2 factory
  '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a': true, // v2 router 01
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': true, // v2 router 02
} */

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): /* {
  currencies: { [field in Field]?: Currency | null }
  currencyBalances: { [field in Field]?: CurrencyAmount<Currency> }
  parsedAmount: CurrencyAmount<Currency> | undefined
  inputError?: ReactNode
  trade: {
    trade: InterfaceTrade<Currency, Currency, TradeType> | undefined
    state: TradeState
  }
  allowedSlippage: Percent
} */ DerivedSwapInfo {
  // MOD: chainId
  const { account, chainId } = useActiveWeb3React()

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

  const relevantTokenBalances = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [inputCurrency ?? undefined, outputCurrency ?? undefined], [inputCurrency, outputCurrency])
  )

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = useMemo(
    () => tryParseCurrencyAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined),
    [inputCurrency, isExactIn, outputCurrency, typedValue]
  )

  /* const trade = useBestTrade(
    isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT,
    parsedAmount,
    (isExactIn ? outputCurrency : inputCurrency) ?? undefined
  ) */

  const { quote } = useGetQuoteAndStatus({
    token: inputCurrencyId,
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

  const currencyBalances = useMemo(
    () => ({
      [Field.INPUT]: relevantTokenBalances[0],
      [Field.OUTPUT]: relevantTokenBalances[1],
    }),
    [relevantTokenBalances]
  )

  const currencies: { [field in Field]?: Currency | null } = useMemo(
    () => ({
      [Field.INPUT]: inputCurrency,
      [Field.OUTPUT]: outputCurrency,
    }),
    [inputCurrency, outputCurrency]
  )

  // allowed slippage is either auto slippage, or custom user defined slippage if auto slippage disabled
  const autoSlippageTolerance = useAutoSlippageTolerance(trade.trade)
  const allowedSlippage = useUserSlippageToleranceWithDefault(autoSlippageTolerance)

  const inputError = useMemo(() => {
    let inputError: ReactNode | undefined

    if (!account) {
      inputError = <Trans>Connect Wallet</Trans>
    }

    if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
      inputError = inputError ?? <Trans>Select a token</Trans>
    }

    if (!parsedAmount) {
      inputError = inputError ?? <Trans>Enter an amount</Trans>
    }

    const formattedTo = isAddress(to)
    if (!to || !formattedTo) {
      inputError = inputError ?? <Trans>Enter a recipient</Trans>
    } else {
      if (BAD_RECIPIENT_ADDRESSES[formattedTo]) {
        inputError = inputError ?? <Trans>Invalid recipient</Trans>
      }
    }

    // compare input balance to max input based on version
    const [balanceIn, amountIn] = [currencyBalances[Field.INPUT], trade.trade?.maximumAmountIn(allowedSlippage)]

    if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
      inputError = <Trans>Insufficient {amountIn.currency.symbol} balance</Trans>
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
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
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
