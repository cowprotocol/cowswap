import * as styledEl from './styled'
import { useHistory } from 'react-router-dom'
import { CurrencyInputPanel } from 'cow-react/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'cow-react/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from 'cow-react/common/pure/AddRecipient'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import React, { useCallback } from 'react'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from 'cow-react/common/pure/CurrencyInputPanel/typings'
import { Field } from 'state/swap/actions'
import { ButtonSize } from 'theme'
import { useLimitOrdersTradeState } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { Currency } from '@uniswap/sdk-core'
import { parameterizeLimitOrdersRoute } from 'cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { useWeb3React } from '@web3-react/core'
import { useSetupLimitOrdersState } from 'cow-react/modules/limitOrders/hooks/useSetupLimitOrdersState'
import { useAtom } from 'jotai'
import { limitOrdersAtom } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'

export function LimitOrdersWidget() {
  useSetupLimitOrdersState()

  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount } = useLimitOrdersTradeState()
  const history = useHistory()
  const [state, setState] = useAtom(limitOrdersAtom)

  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const isTradePriceUpdating = false
  const showSetMax = true
  const showRecipientControls = true
  const priceImpactParams = undefined
  const subsidyAndBalance: BalanceAndSubsidy = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
  }
  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputCurrencyAmount?.toExact() || '',
    balance: null,
    fiatAmount: null,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    rawAmount: outputCurrencyAmount,
    viewAmount: outputCurrencyAmount?.toExact() || '',
    balance: null,
    fiatAmount: null,
    receiveAmountInfo: null,
  }
  const onCurrencySelection = useCallback(
    (field: Field, currency: Currency) => {
      const inputCurrencyId = (field === Field.INPUT ? currency.symbol : inputCurrency?.symbol) || ''
      const outputCurrencyId = (field === Field.OUTPUT ? currency.symbol : outputCurrency?.symbol) || ''
      const route = parameterizeLimitOrdersRoute(chainId, inputCurrencyId, outputCurrencyId)

      history.push(route)
    },
    [history, chainId, inputCurrency, outputCurrency]
  )
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      const inputCurrencyAmount = field === Field.INPUT ? typedValue : state.inputCurrencyAmount
      const outputCurrencyAmount = field === Field.OUTPUT ? typedValue : state.outputCurrencyAmount

      setState({ ...state, inputCurrencyAmount, outputCurrencyAmount })
    },
    [setState, state]
  )

  const onSwitchTokens = useCallback(() => {
    const route = parameterizeLimitOrdersRoute(chainId, state.outputCurrencyId, state.inputCurrencyId)

    history.push(route)
  }, [history, state, chainId])

  const onChangeRecipient = () => {
    //
  }

  console.log('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  return (
    <styledEl.Container>
      <styledEl.ContainerBox>
        <styledEl.Header>
          <div>Limit orders</div>
          <styledEl.SettingsButton>
            <styledEl.SettingsTitle>Settings</styledEl.SettingsTitle>
            <styledEl.SettingsIcon />
          </styledEl.SettingsButton>
        </styledEl.Header>
        <CurrencyInputPanel
          id="swap-currency-input"
          loading={currenciesLoadingInProgress}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          subsidyAndBalance={subsidyAndBalance}
          allowsOffchainSigning={allowsOffchainSigning}
          currencyInfo={inputCurrencyInfo}
          showSetMax={showSetMax}
        />
        <styledEl.CurrencySeparatorBox withRecipient={showRecipientControls}>
          <CurrencyArrowSeparator
            onSwitchTokens={onSwitchTokens}
            withRecipient={showRecipientControls}
            isLoading={isTradePriceUpdating}
          />
          <AddRecipient onChangeRecipient={onChangeRecipient} />
        </styledEl.CurrencySeparatorBox>
        <CurrencyInputPanel
          id="swap-currency-output"
          loading={currenciesLoadingInProgress}
          onCurrencySelection={onCurrencySelection}
          onUserInput={onUserInput}
          subsidyAndBalance={subsidyAndBalance}
          allowsOffchainSigning={allowsOffchainSigning}
          currencyInfo={outputCurrencyInfo}
          priceImpactParams={priceImpactParams}
        />
        <styledEl.TradeButtonBox>
          <ButtonPrimary disabled={false} buttonSize={ButtonSize.BIG}>
            <Trans>Trade</Trans>
          </ButtonPrimary>
        </styledEl.TradeButtonBox>
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
