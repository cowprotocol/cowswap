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

const NewSwapPageInner = React.memo(function (props: NewSwapPageProps) {
  const { allowedSlippage, typedValue, isGettingNewQuote, inputCurrencyInfo, outputCurrencyInfo } = props

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.Container>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel currencyInfo={inputCurrencyInfo} typedValue={typedValue} />
      <CurrencyArrowSeparator isLoading={isGettingNewQuote} />
      <styledEl.DestCurrencyInputPanel currencyInfo={outputCurrencyInfo} typedValue={''} />
      <ReceiveAmount />
      <TradeRates />
      <TradeButton>Trade</TradeButton>
    </styledEl.Container>
  )
}, swapPagePropsChecker)

export function NewSwapPage() {
  const { chainId, account } = useWeb3React()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()

  const { typedValue, INPUT } = useSwapState()
  const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    balance: useCurrencyBalance(account ?? undefined, currencies.INPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    balance: useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
  }

  useSetupSwapState()

  const props: NewSwapPageProps = {
    allowedSlippage,
    typedValue,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
  }

  return <NewSwapPageInner {...props} />
}
