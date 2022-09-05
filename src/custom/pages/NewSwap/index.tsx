import React from 'react'
import * as styledEl from './styled'
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
import { useSwapCurrenciesAmounts } from 'pages/NewSwap/hooks/useSwapCurrenciesAmounts'
import usePriceImpact from 'hooks/usePriceImpact'
import { formatSmartAmount } from 'utils/format'
import { useWrapType, WrapType } from 'hooks/useWrapCallback'
import { getInputReceiveAmountInfo, getOutputReceiveAmountInfo } from 'pages/NewSwap/helpers/tradeReceiveAmount'

const NewSwapPageInner = React.memo(function (props: NewSwapPageProps) {
  const { allowedSlippage, isGettingNewQuote, inputCurrencyInfo, outputCurrencyInfo, priceImpactParams } = props

  console.log('SWAP PAGE RENDER: ', props)

  return (
    <styledEl.Container>
      <styledEl.SwapHeaderStyled allowedSlippage={allowedSlippage} />

      <CurrencyInputPanel currencyInfo={inputCurrencyInfo} />
      <CurrencyArrowSeparator isLoading={isGettingNewQuote} />
      <CurrencyInputPanel currencyInfo={outputCurrencyInfo} priceImpactParams={priceImpactParams} />
      <TradeRates />
      <TradeButton>Trade</TradeButton>
    </styledEl.Container>
  )
}, swapPagePropsChecker)

export function NewSwapPage() {
  const { chainId, account } = useWeb3React()
  const { INPUT, independentField } = useSwapState()
  const { allowedSlippage, currencies, v2Trade: trade } = useDerivedSwapInfo()
  const wrapType = useWrapType()
  const parsedAmounts = useSwapCurrenciesAmounts(wrapType)
  const isWrapUnwrapMode = wrapType !== WrapType.NOT_APPLICABLE

  const { isGettingNewQuote } = useGetQuoteAndStatus({
    token: currencies.INPUT?.isNative ? currencies.INPUT.wrapped.address : INPUT.currencyId,
    chainId,
  })

  const priceImpactParams = usePriceImpact({
    abTrade: trade,
    parsedAmounts,
    isWrapping: isWrapUnwrapMode,
  })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: currencies.INPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.INPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.INPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.inputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.OUTPUT && trade ? getInputReceiveAmountInfo(trade) : null,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: currencies.OUTPUT || null,
    viewAmount: formatSmartAmount(parsedAmounts.OUTPUT) || '',
    balance: useCurrencyBalance(account ?? undefined, currencies.OUTPUT) || null,
    fiatAmount: useHigherUSDValue(trade?.outputAmountWithoutFee),
    receiveAmountInfo: independentField === Field.INPUT && trade ? getOutputReceiveAmountInfo(trade) : null,
  }

  useSetupSwapState()

  const props: NewSwapPageProps = {
    allowedSlippage,
    isGettingNewQuote,
    inputCurrencyInfo,
    outputCurrencyInfo,
    priceImpactParams,
  }

  return <NewSwapPageInner {...props} />
}
