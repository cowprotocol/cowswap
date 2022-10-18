import * as styledEl from './styled'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import React, { useCallback } from 'react'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { Field } from 'state/swap/actions'
import { ButtonSize } from 'theme'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useWeb3React } from '@web3-react/core'
import { useSetupLimitOrdersState } from '@cow/modules/limitOrders/hooks/useSetupLimitOrdersState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '@cow/modules/limitOrders/state/limitOrdersAtom'
import { useOnCurrencySelection } from '@cow/modules/limitOrders/hooks/useOnCurrencySelection'
import { useResetStateWithSymbolDuplication } from '@cow/modules/limitOrders/hooks/useResetStateWithSymbolDuplication'
import { useLimitOrdersNavigate } from '@cow/modules/limitOrders/hooks/useLimitOrdersNavigate'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { useTradeFlowContext } from '@cow/modules/limitOrders/hooks/useTradeFlowContext'
import { tradeFlow } from '@cow/modules/limitOrders/services/tradeFlow'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { Dropdown } from '@cow/common/pure/Dropdown'
import { SettingsWidget } from '../SettingsWidget'

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
          <ButtonPrimary onClick={doTrade} disabled={false} buttonSize={ButtonSize.BIG}>
            <Trans>Trade</Trans>
          </ButtonPrimary>
        </styledEl.TradeButtonBox>
      </styledEl.ContainerBox>
    </styledEl.Container>
  )
}
