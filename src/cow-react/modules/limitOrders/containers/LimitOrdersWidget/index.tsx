import * as styledEl from './styled'
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
import { useWeb3React } from '@web3-react/core'
import { useSetupLimitOrdersState } from 'cow-react/modules/limitOrders/hooks/useSetupLimitOrdersState'
import { limitOrdersAtom, updateLimitOrdersAtom } from 'cow-react/modules/limitOrders/state/limitOrdersAtom'
import { useOnCurrencySelection } from 'cow-react/modules/limitOrders/hooks/useOnCurrencySelection'
import { useResetStateWithSymbolDuplication } from 'cow-react/modules/limitOrders/hooks/useResetStateWithSymbolDuplication'
import { useLimitOrdersNavigate } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersNavigate'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'

// TODO: move the widget to Swap module
export function LimitOrdersWidget() {
  useSetupLimitOrdersState()
  useResetStateWithSymbolDuplication()

  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency, inputCurrencyAmount, outputCurrencyAmount, recipient } =
    useLimitOrdersTradeState()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const onCurrencySelection = useOnCurrencySelection()
  const limitOrdersNavigate = useLimitOrdersNavigate()

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
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      if (field === Field.INPUT) {
        updateLimitOrdersState({ inputCurrencyId: typedValue })
      } else {
        updateLimitOrdersState({ outputCurrencyId: typedValue })
      }
    },
    [updateLimitOrdersState]
  )

  const onSwitchTokens = useCallback(() => {
    const { inputCurrencyId, outputCurrencyId } = state
    limitOrdersNavigate(chainId, outputCurrencyId, inputCurrencyId)
  }, [limitOrdersNavigate, state, chainId])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

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
        {recipient !== null && (
          <styledEl.StyledRemoveRecipient recipient={recipient} onChangeRecipient={onChangeRecipient} />
        )}
        <styledEl.TradeButtonBox>
          <ButtonPrimary disabled={false} buttonSize={ButtonSize.BIG}>
            <Trans>Trade</Trans>
          </ButtonPrimary>
        </styledEl.TradeButtonBox>
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
