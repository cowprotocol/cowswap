import useENS from 'hooks/useENS'
import { Currency, CurrencyAmount, ETHER, Trade, WETH } from '@uniswap/sdk'
import { useActiveWeb3React } from 'hooks'
import { useCurrency } from 'hooks/Tokens'
import { isAddress } from 'utils'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { computeSlippageAdjustedAmounts } from 'utils/prices'
import {
  parseIndependentFieldURLParameter,
  parseTokenAmountURLParameter,
  tryParseAmount,
  useSwapState,
  validatedRecipient
} from 'state/swap/hooks'
import { useFee } from '../fee/hooks'
import { registerOnWindow } from 'utils/misc'
import { useTradeExactInWithFee, useTradeExactOutWithFee } from './extension'
import useParsedQueryString from 'hooks/useParsedQueryString'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { SwapState } from 'state/swap/reducer'
import { ParsedQs } from 'qs'
import { useWETHContract } from 'hooks/useContract'

export * from '@src/state/swap/hooks'

interface DerivedSwapInfo {
  currencies: { [field in Field]?: Currency }
  currencyBalances: { [field in Field]?: CurrencyAmount }
  parsedAmount: CurrencyAmount | undefined
  v2Trade: Trade | undefined
  // TODO: review this - we don't use a v1 trade but changing all code
  // or extending whole swap comp for only removing v1trade is a lot
  v1Trade: undefined
  inputError?: string
}

// from the current swap inputs, compute the best trade and return it.
export function useDerivedSwapInfo(): DerivedSwapInfo {
  const { account, chainId } = useActiveWeb3React()

  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
    recipient
  } = useSwapState()

  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const recipientLookup = useENS(recipient ?? undefined)
  const to: string | null = (recipient === null ? account : recipientLookup.address) ?? null

  const relevantTokenBalances = useCurrencyBalances(account ?? undefined, [
    inputCurrency ?? undefined,
    outputCurrency ?? undefined
  ])

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)

  const feeInformation = useFee({
    token: inputCurrencyId,
    chainId
  })

  const bestTradeExactIn = useTradeExactInWithFee({
    parsedAmount: isExactIn ? parsedAmount : undefined,
    outputCurrency,
    feeInformation
  })
  const bestTradeExactOut = useTradeExactOutWithFee({
    parsedAmount: isExactIn ? undefined : parsedAmount,
    inputCurrency,
    feeInformation
  })

  const v2Trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  registerOnWindow({ trade: v2Trade })

  const currencyBalances = {
    [Field.INPUT]: relevantTokenBalances[0],
    [Field.OUTPUT]: relevantTokenBalances[1]
  }

  const currencies: { [field in Field]?: Currency } = {
    [Field.INPUT]: inputCurrency ?? undefined,
    [Field.OUTPUT]: outputCurrency ?? undefined
  }

  let inputError: string | undefined
  if (!account) {
    inputError = 'Connect Wallet'
  }

  if (!parsedAmount) {
    inputError = inputError ?? 'Enter an amount'
  }

  if (!currencies[Field.INPUT] || !currencies[Field.OUTPUT]) {
    inputError = inputError ?? 'Select a token'
  }

  const formattedTo = isAddress(to)
  if (!to || !formattedTo) {
    inputError = inputError ?? 'Enter a recipient'
  }

  const [allowedSlippage] = useUserSlippageTolerance()

  const slippageAdjustedAmounts = v2Trade && allowedSlippage && computeSlippageAdjustedAmounts(v2Trade, allowedSlippage)

  // compare input balance to max input based on version
  const [balanceIn, amountIn] = [
    currencyBalances[Field.INPUT],
    slippageAdjustedAmounts ? slippageAdjustedAmounts[Field.INPUT] : null
  ]

  if (balanceIn && amountIn && balanceIn.lessThan(amountIn)) {
    inputError = 'Insufficient ' + amountIn.currency.symbol + ' balance'
  }

  return {
    currencies,
    currencyBalances,
    parsedAmount,
    v2Trade: v2Trade ?? undefined,
    inputError,
    v1Trade: undefined
  }
}

// export function parseCurrencyFromURLParameter(urlParam: any): string {
export function parseCurrencyFromURLParameter(urlParam?: string | string[] | ParsedQs | ParsedQs[]): string {
  if (typeof urlParam === 'string' && urlParam?.toUpperCase() === 'ETH') return 'ETH'

  const validTokenAddress = isAddress(urlParam)

  if (typeof urlParam === 'string' && validTokenAddress) {
    return validTokenAddress
  } else {
    // return empty token
    return ''
  }
}

export function queryParametersToSwapState(parsedQs: ParsedQs): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  if (inputCurrency === outputCurrency) {
    if (typeof parsedQs.outputCurrency === 'string') {
      inputCurrency = ''
    } else {
      outputCurrency = ''
    }
  }

  const recipient = validatedRecipient(parsedQs.recipient)

  return {
    [Field.INPUT]: {
      currencyId: inputCurrency
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency
    },
    typedValue: parseTokenAmountURLParameter(parsedQs.exactAmount),
    independentField: parseIndependentFieldURLParameter(parsedQs.exactField),
    recipient
  }
}

export function useReplaceSwapState() {
  const dispatch = useDispatch()
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
    const parsed = queryParametersToSwapState(parsedQs)

    replaceSwapState({
      typedValue: parsed.typedValue,
      field: parsed.independentField,
      // inputCurrencyId: parsed[Field.INPUT].currencyId,
      // outputCurrencyId: parsed[Field.OUTPUT].currencyId,

      // Default to WETH
      inputCurrencyId: parsed[Field.INPUT].currencyId || defaultInputToken,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId,
      recipient: parsed.recipient
    })

    setResult({ inputCurrencyId: parsed[Field.INPUT].currencyId, outputCurrencyId: parsed[Field.OUTPUT].currencyId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  return result
}

interface CurrencyWithAddress {
  currency?: Currency
  address?: string
}

export function useShouldDisableEth(input?: CurrencyWithAddress, output?: CurrencyWithAddress) {
  const weth = useWETHContract()
  return useMemo(() => {
    const [isEthIn, isEthOut] = [input?.currency === ETHER, output?.currency === ETHER]
    const [isWethIn, isWethOut] = [input?.address === weth?.address, output?.address === weth?.address]

    return { showEthDisabled: (isEthIn && !isWethOut) || (isEthOut && !isWethIn), weth }
  }, [input, output, weth])
}
