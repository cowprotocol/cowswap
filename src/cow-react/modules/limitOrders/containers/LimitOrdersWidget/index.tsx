import * as styledEl from './styled'
import { CurrencyInputPanel } from 'cow-react/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from 'cow-react/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from 'cow-react/common/pure/AddRecipient'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import React from 'react'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from 'cow-react/common/pure/CurrencyInputPanel/typings'
import { Field } from 'state/swap/actions'
import { GNO, USDC } from 'constants/tokens'
import { ButtonSize } from 'theme'

export function LimitOrdersWidget() {
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
    currency: USDC[1],
    rawAmount: null,
    viewAmount: '1',
    balance: null,
    fiatAmount: null,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: GNO[1],
    rawAmount: null,
    viewAmount: '2',
    balance: null,
    fiatAmount: null,
    receiveAmountInfo: null,
  }
  const onCurrencySelection = () => {
    //
  }
  const onUserInput = () => {
    //
  }
  const onChangeRecipient = () => {
    //
  }

  const onSwitchTokens = () => {
    //
  }

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
