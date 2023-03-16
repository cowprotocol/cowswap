import styled from 'styled-components/macro'
import * as styledEl from '@cow/modules/limitOrders/containers/LimitOrdersWidget/styled'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import React, { useCallback, useState } from 'react'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { Field } from 'state/swap/actions'
import { Trans } from '@lingui/macro'
import { SwapButton } from '@cow/modules/limitOrders/containers/TradeButtons/limitOrdersTradeButtonsMap'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { formatInputAmount } from '@cow/utils/amountFormat'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import AddressInputPanel from '@src/components/AddressInputPanel'
import { useBindFallbackHandler } from '@cow/modules/twapOrders/hooks/useBindFallbackHandler'
import { useCreateTwapOrder } from '@cow/modules/twapOrders/hooks/useCreateTwapOrder'
import { useGnosisSafeInfo } from '@cow/modules/wallet'
import Loader from 'components/Loader'

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 490px;
  width: 100%;
  width: 470px;
  span {
    color: red;
  }
`

export function TwapWidget() {
  const chainId = 100
  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const showSetMax = false
  const isRateLoading = false
  const subsidyAndBalance = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
  }

  const gnosisSafeInfo = useGnosisSafeInfo()
  const [isBindingInProgress, setIsBindingInProgress] = useState(false)
  const [isOrderInProgress, setIsOrderInProgress] = useState(false)

  const [frequency, setFrequency] = useState<string>('')
  const [timeInterval, setTimeInterval] = useState<string>('')

  const [inputCurrency, setInputCurrency] = useState<Currency | null>(WETH[chainId])
  const [outputCurrency, setOutputCurrency] = useState<Currency | null>(null)

  const [inputCurrencyAmount, setInputCurrencyAmount] = useState<CurrencyAmount<Currency> | null>(null)
  const [outputCurrencyAmount, setOutputCurrencyAmount] = useState<CurrencyAmount<Currency> | null>(null)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    viewAmount: formatInputAmount(inputCurrencyAmount),
    rawAmount: inputCurrencyAmount,
    receiveAmountInfo: null,
    currency: inputCurrency,
    balance: null,
    fiatAmount: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    viewAmount: formatInputAmount(outputCurrencyAmount),
    rawAmount: outputCurrencyAmount,
    receiveAmountInfo: null,
    currency: outputCurrency,
    balance: null,
    fiatAmount: null,
  }

  const onCurrencySelection = useCallback((field: Field, currency: Currency) => {
    if (field === Field.INPUT) {
      setInputCurrency(currency)
    } else {
      setOutputCurrency(currency)
    }
  }, [])

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const currency = field === Field.INPUT ? inputCurrency : outputCurrency

      if (!currency) return

      const value = tryParseCurrencyAmount(typedValue, currency) || null

      if (field === Field.INPUT) {
        setInputCurrencyAmount(value)
      } else {
        setOutputCurrencyAmount(value)
      }
    },
    [inputCurrency, outputCurrency]
  )
  const onSwitchTokens = useCallback(() => {
    setInputCurrency(outputCurrency)
    setOutputCurrency(inputCurrency)
  }, [inputCurrency, outputCurrency])

  const createTwapOrder = useCreateTwapOrder()
  const bindTwapHandler = useBindFallbackHandler(setIsBindingInProgress)

  const createOrder = useCallback(async () => {
    if (!inputCurrencyAmount || !outputCurrencyAmount) return

    setIsOrderInProgress(true)
    await createTwapOrder(inputCurrencyAmount, outputCurrencyAmount, +frequency, +timeInterval)
    setIsOrderInProgress(false)
  }, [createTwapOrder, inputCurrencyAmount, outputCurrencyAmount, frequency, timeInterval])

  return (
    <>
      <styledEl.Container>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
          </styledEl.Header>

          {gnosisSafeInfo !== undefined ? (
            <>
              <CurrencyInputPanel
                id="limit-orders-currency-input"
                disableNonToken={false}
                chainId={chainId}
                loading={currenciesLoadingInProgress}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                subsidyAndBalance={subsidyAndBalance}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={inputCurrencyInfo}
                showSetMax={showSetMax}
              />
              <styledEl.CurrencySeparatorBox withRecipient={false}>
                <CurrencyArrowSeparator
                  isCollapsed={false}
                  onSwitchTokens={onSwitchTokens}
                  withRecipient={false}
                  isLoading={false}
                  hasSeparatorLine={true}
                  border={true}
                />
              </styledEl.CurrencySeparatorBox>
              <CurrencyInputPanel
                id="limit-orders-currency-output"
                disableNonToken={false}
                chainId={chainId}
                loading={currenciesLoadingInProgress}
                isRateLoading={isRateLoading}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                subsidyAndBalance={subsidyAndBalance}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={outputCurrencyInfo}
                topLabel={outputCurrencyInfo.label}
              />
              <div>
                <br />
                <AddressInputPanel
                  isPlainInput={true}
                  label="Nº of Intervals"
                  placeholder=""
                  value={frequency}
                  onChange={setFrequency}
                />
                <br />
                <AddressInputPanel
                  isPlainInput={true}
                  label="Time interval"
                  placeholder="In seconds"
                  value={timeInterval}
                  onChange={setTimeInterval}
                />
              </div>
              <div>
                <br />
                <SwapButton id="bind-twap-handler" onClick={bindTwapHandler} disabled={isBindingInProgress}>
                  {isBindingInProgress ? <Loader /> : <Trans>Bind handler</Trans>}
                </SwapButton>
                <br />
                <SwapButton id="twap-trade" onClick={createOrder} disabled={isOrderInProgress}>
                  {isOrderInProgress ? <Loader /> : <Trans>Create order</Trans>}
                </SwapButton>
              </div>
            </>
          ) : (
            <div>
              <ErrorMessage>
                <span>Please connect a Gnosis Safe</span>
              </ErrorMessage>
            </div>
          )}
        </styledEl.ContainerBox>
      </styledEl.Container>
    </>
  )
}
