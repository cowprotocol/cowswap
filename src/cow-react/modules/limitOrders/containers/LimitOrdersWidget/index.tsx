import { useWeb3React } from '@web3-react/core'
import React, { useCallback } from 'react'
import { Trans } from '@lingui/macro'
import * as styledEl from './styled'
import { ButtonSize } from 'theme'
import { Field } from 'state/swap/actions'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { Dropdown } from '@cow/common/pure/Dropdown'
import { ButtonPrimary } from 'components/Button'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { useSetupLimitOrdersState } from '../../hooks/useSetupLimitOrdersState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '../../state/limitOrdersAtom'
import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useResetStateWithSymbolDuplication } from '../../hooks/useResetStateWithSymbolDuplication'
import { useLimitOrdersNavigate } from '../../hooks/useLimitOrdersNavigate'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { tradeFlow } from '../../services/tradeFlow'
import { limitOrdersQuoteAtom } from '../../state/limitOrdersQuoteAtom'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

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
  const limitOrdersQuote = useAtomValue(limitOrdersQuoteAtom)
  const settingsState = useAtomValue(limitOrdersSettingsAtom)

  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const isTradePriceUpdating = false
  const showSetMax = true
  const showRecipientControls = settingsState.showRecipient
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
  const tradeContext = useTradeFlowContext(limitOrdersQuote)
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      if (field === Field.INPUT) {
        updateLimitOrdersState({ inputCurrencyAmount: typedValue })
      } else {
        updateLimitOrdersState({ outputCurrencyAmount: typedValue })
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

  const doTrade = useCallback(() => {
    tradeContext && tradeFlow(tradeContext)
  }, [tradeContext])

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  return (
    <styledEl.Container>
      <styledEl.ContainerBox>
        <styledEl.Header>
          <div>Limit orders</div>
          <Dropdown content={<SettingsWidget />}>
            <styledEl.SettingsButton>
              <styledEl.SettingsTitle>Settings</styledEl.SettingsTitle>
              <styledEl.SettingsIcon />
            </styledEl.SettingsButton>
          </Dropdown>
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
          {showRecipientControls && <AddRecipient onChangeRecipient={onChangeRecipient} />}
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
          <ButtonPrimary onClick={doTrade} disabled={false} buttonSize={ButtonSize.BIG}>
            <Trans>Trade</Trans>
          </ButtonPrimary>
        </styledEl.TradeButtonBox>
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
