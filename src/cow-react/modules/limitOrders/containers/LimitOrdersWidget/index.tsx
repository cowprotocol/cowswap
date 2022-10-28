import { useWeb3React } from '@web3-react/core'
import * as styledEl from './styled'
import { ButtonSize } from 'theme'
import { Field } from 'state/swap/actions'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import { ButtonPrimary } from 'components/Button'
import { Trans } from '@lingui/macro'
import React, { useCallback, useState } from 'react'
import { useSetAtom } from 'jotai'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/typings'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { useSetupLimitOrdersState } from '../../hooks/useSetupLimitOrdersState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '../../state/limitOrdersAtom'
import { useOnCurrencySelection } from '../../hooks/useOnCurrencySelection'
import { useResetStateWithSymbolDuplication } from '../../hooks/useResetStateWithSymbolDuplication'
import { useLimitOrdersNavigate } from '../../hooks/useLimitOrdersNavigate'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { RateInput } from '../RateInput'
import { ExpiryDate } from '../ExpiryDate'
import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { tradeFlow } from '../../services/tradeFlow'
import { limitOrdersQuoteAtom } from '../../state/limitOrdersQuoteAtom'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { limitOrdersConfirmState } from '../LimitOrdersConfirmModal/state'

export function LimitOrdersWidget() {
  useSetupLimitOrdersState()
  useResetStateWithSymbolDuplication()

  const { chainId } = useWeb3React()
  const {
    inputCurrency,
    outputCurrency,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrencyBalance,
    outputCurrencyBalance,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
    recipient,
  } = useLimitOrdersTradeState()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const onCurrencySelection = useOnCurrencySelection()
  const limitOrdersNavigate = useLimitOrdersNavigate()
  const { showRecipient, expertMode } = useAtomValue(limitOrdersSettingsAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const isSellOrder = useIsSellOrder()
  const limitOrdersQuote = useAtomValue(limitOrdersQuoteAtom)
  const setConfirmationState = useSetAtom(limitOrdersConfirmState)
  const tradeContext = useTradeFlowContext(limitOrdersQuote)

  const [showConfirmation, setShowConfirmation] = useState(false)

  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const isTradePriceUpdating = false
  const showSetMax = true
  const priceImpactParams = undefined
  const subsidyAndBalance: BalanceAndSubsidy = {
    subsidy: {
      tier: 0,
      discount: 0,
    },
  }
  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    rawAmount: inputCurrencyAmount,
    viewAmount: inputCurrencyAmount?.toExact() || '',
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isSellOrder ? 'Your receive at least' : 'You receive exactly',
    currency: outputCurrency,
    rawAmount: outputCurrencyAmount,
    viewAmount: outputCurrencyAmount?.toExact() || '',
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      if (field === Field.INPUT) {
        updateCurrencyAmount({ inputCurrencyAmount: typedValue })
      } else {
        updateCurrencyAmount({ outputCurrencyAmount: typedValue })
      }
    },
    [updateCurrencyAmount]
  )

  const onSwitchTokens = useCallback(() => {
    const { inputCurrencyId, outputCurrencyId, inputCurrencyAmount } = state
    limitOrdersNavigate(chainId, outputCurrencyId, inputCurrencyId)
    updateCurrencyAmount({ outputCurrencyAmount: inputCurrencyAmount })
  }, [state, limitOrdersNavigate, chainId, updateCurrencyAmount])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  const doTrade = useCallback(() => {
    if (expertMode) {
      if (tradeContext) {
        setConfirmationState({ isPending: true, orderHash: null })

        tradeFlow(tradeContext).finally(() => {
          setConfirmationState({ isPending: false, orderHash: null })
        })
      }
    } else {
      setShowConfirmation(true)
    }
  }, [expertMode, tradeContext, setShowConfirmation, setConfirmationState])

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  return (
    <>
      <styledEl.Container>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <div>Limit orders</div>
            <SettingsWidget />
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
            topLabel={inputCurrencyInfo.label}
          />
          <styledEl.RateWrapper>
            <RateInput />
            <ExpiryDate />
          </styledEl.RateWrapper>
          <styledEl.CurrencySeparatorBox withRecipient={showRecipient}>
            <CurrencyArrowSeparator
              onSwitchTokens={onSwitchTokens}
              withRecipient={showRecipient}
              isLoading={isTradePriceUpdating}
            />
            {showRecipient && <AddRecipient onChangeRecipient={onChangeRecipient} />}
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
            topLabel={outputCurrencyInfo.label}
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
      {tradeContext && (
        <LimitOrdersConfirmModal
          isOpen={showConfirmation}
          tradeContext={tradeContext}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
    </>
  )
}
