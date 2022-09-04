import React from 'react'
import * as styledEl from './styled'
import { ReceiveAmount } from './pureComponents/ReceiveAmount'
import { CurrencyInputPanel } from './pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from './pureComponents/CurrencyArrowSeparator'
import { TradeRates } from './pureComponents/TradeRates'
import { TradeButton } from './pureComponents/TradeButton'
import { useDerivedSwapInfo, useSwapState } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'
import { useCurrencyBalance } from '@src/state/connection/hooks'
import { useWeb3React } from '@web3-react/core'
import { CurrencyInfo, NewSwapPageProps } from 'pages/NewSwap/typings'
import { useHigherUSDValue } from 'hooks/useStablecoinPrice'
import { swapPagePropsChecker } from 'pages/NewSwap/propsChecker'
import { useGetQuoteAndStatus } from 'state/price/hooks'
import { useSwapCurrenciesViewAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesViewAmounts'

const NewSwapPageInner = React.memo(function (props: NewSwapPageProps) {
  const { allowedSlippage, isGettingNewQuote, inputCurrencyInfo, outputCurrencyInfo } = props

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.Container>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel currencyInfo={inputCurrencyInfo} />
      <CurrencyArrowSeparator isLoading={isGettingNewQuote} />
      <styledEl.DestCurrencyInputPanel currencyInfo={outputCurrencyInfo} />
      <ReceiveAmount />
      <TradeRates />
      <TradeButton>Trade</TradeButton>
    </styledEl.Container>
  )
}, swapPagePropsChecker)

export function NewSwapPage() {
  const { chainId, account } = useWeb3React()
  const { INPUT } = useSwapState()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()
  const { INPUT: inputViewAmount, OUTPUT: outputViewAmount } = useSwapCurrenciesViewAmounts()

  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    viewAmount: inputViewAmount,
    balance: useCurrencyBalance(account ?? undefined, currencies.INPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    viewAmount: outputViewAmount,
    balance: useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
  }

  useSetupSwapState()

  const props: NewSwapPageProps = {
    allowedSlippage,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
  }

  return <NewSwapPageInner {...props} />
}
