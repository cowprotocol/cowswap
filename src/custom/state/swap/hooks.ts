import useENS from '@src/hooks/useENS'
import { Currency, CurrencyAmount, Trade } from '@uniswap/sdk'
import { useActiveWeb3React } from '@src/hooks'
import { useCurrency } from '@src/hooks/Tokens'
import { isAddress } from '@src/utils'
import { useCurrencyBalances } from '@src/state/wallet/hooks'
import { Field } from '@src/state/swap/actions'
import { useUserSlippageTolerance } from '@src/state/user/hooks'
import { computeSlippageAdjustedAmounts } from '@src/utils/prices'
import { tryParseAmount, useSwapState } from '@src/state/swap/hooks'
import { useFee } from '../fee/hooks'
import { registerOnWindow } from 'utils/misc'
import { useTradeExactInWithFee, useTradeExactOutWithFee } from './extension'

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
    parsedAmount,
    outputCurrency,
    feeInformation
  })
  const bestTradeExactOut = useTradeExactOutWithFee({
    parsedAmount,
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
