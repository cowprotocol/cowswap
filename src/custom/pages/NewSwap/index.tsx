import React from 'react'
import * as styledEl from './styled'
import { ReceiveAmount } from './pureComponents/ReceiveAmount'
import { CurrencyInputPanel } from './pureComponents/CurrencyInputPanel'
import { CurrencyArrowSeparator } from './pureComponents/CurrencyArrowSeparator'
import { TradeRates } from './pureComponents/TradeRates'
import { TradeButton } from './pureComponents/TradeButton'
import { Currencies, useDerivedSwapInfo } from 'state/swap/hooks'
import { Field } from 'state/swap/actions'
import { Percent } from '@uniswap/sdk-core'
import { useSetupSwapState } from 'pages/NewSwap/hooks/useSetupSwapState'

interface NewSwapPageProps {
  currencies: Currencies
  allowedSlippage: Percent
}

function swapPagePropsChecker(prev: NewSwapPageProps, next: NewSwapPageProps): boolean {
  const isInputCurrencyEqual =
    prev.currencies.INPUT && next.currencies.INPUT
      ? prev.currencies.INPUT.equals(next.currencies.INPUT)
      : prev.currencies.INPUT === next.currencies.INPUT

  const isOutputCurrencyEqual =
    prev.currencies.OUTPUT && next.currencies.OUTPUT
      ? prev.currencies.OUTPUT.equals(next.currencies.OUTPUT)
      : prev.currencies.OUTPUT === next.currencies.OUTPUT

  return prev.allowedSlippage.equalTo(next.allowedSlippage) && isInputCurrencyEqual && isOutputCurrencyEqual
}

const NewSwapPageInner = React.memo(function (props: NewSwapPageProps) {
  const { currencies, allowedSlippage } = props
  const currencyIn = currencies[Field.INPUT] || undefined
  const currencyOut = currencies[Field.OUTPUT] || undefined

  // const { INPUT } = useSwapState()
  // const { quote, isGettingNewQuote } = useGetQuoteAndStatus({
  //   token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
  //   chainId,
  // })

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.Container>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel field={Field.INPUT} currency={currencyIn} />
      <CurrencyArrowSeparator isLoading={false} />
      <styledEl.DestCurrencyInputPanel field={Field.OUTPUT} currency={currencyOut} />
      <ReceiveAmount />
      <TradeRates />
      <TradeButton>Trade</TradeButton>
    </styledEl.Container>
  )
}, swapPagePropsChecker)

export function NewSwapPage() {
  const { allowedSlippage, currencies } = useDerivedSwapInfo()

  useSetupSwapState()

  const props: NewSwapPageProps = {
    allowedSlippage,
    currencies,
  }

  return <NewSwapPageInner {...props} />
}
