import { useWeb3React } from '@web3-react/core'
import * as styledEl from './styled'
import { Field } from 'state/swap/actions'
import { CurrencyInputPanel } from '@cow/common/pure/CurrencyInputPanel'
import { CurrencyArrowSeparator } from '@cow/common/pure/CurrencyArrowSeparator'
import { AddRecipient } from '@cow/common/pure/AddRecipient'
import React, { useCallback, useState } from 'react'
import { BalanceAndSubsidy } from 'hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from '@cow/common/pure/CurrencyInputPanel/types'
import { useLimitOrdersTradeState } from '../../hooks/useLimitOrdersTradeState'
import { limitOrdersAtom, updateLimitOrdersAtom } from '../../state/limitOrdersAtom'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { SettingsWidget } from '../SettingsWidget'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { RateInput } from '../RateInput'
import { DeadlineInput } from '../DeadlineInput'
import { useUpdateCurrencyAmount } from '../../hooks/useUpdateCurrencyAmount'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { TradeButtons } from '@cow/modules/limitOrders/containers/TradeButtons'
import { TradeApproveWidget } from '@cow/common/containers/TradeApprove/TradeApproveWidget'
import { useSetupTradeState } from '@cow/modules/trade'
import { useTradeNavigate } from '@cow/modules/trade/hooks/useTradeNavigate'
import { useOnCurrencySelection } from '@cow/modules/trade/hooks/useOnCurrencySelection'
import { ImportTokenModal } from '@cow/modules/trade/containers/ImportTokenModal'
import { useOnImportDismiss } from '@cow/modules/trade/hooks/useOnImportDismiss'
import { limitRateAtom } from '../../state/limitRateAtom'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'
import { useDisableNativeTokenUsage } from '@cow/modules/limitOrders/hooks/useDisableNativeTokenUsage'
import { useActiveRateDisplay } from '@cow/modules/limitOrders/hooks/useActiveRateDisplay'
import { UnlockLimitOrders } from '../../pure/UnlockLimitOrders'
import usePriceImpact from 'hooks/usePriceImpact'
import { LimitOrdersWarnings } from '@cow/modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersPriceImpactParams } from '@cow/modules/limitOrders/hooks/useLimitOrdersPriceImpactParams'

export function LimitOrdersWidget() {
  useSetupTradeState()
  useDisableNativeTokenUsage()

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
    isUnlocked,
  } = useLimitOrdersTradeState()
  const onCurrencySelection = useOnCurrencySelection()
  const onImportDismiss = useOnImportDismiss()
  const limitOrdersNavigate = useTradeNavigate()
  const { showRecipient } = useAtomValue(limitOrdersSettingsAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const isSellOrder = useIsSellOrder()
  const tradeContext = useTradeFlowContext()
  const state = useAtomValue(limitOrdersAtom)
  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersAtom)
  const { isLoading: isRateLoading } = useAtomValue(limitRateAtom)
  const activeRateDisplay = useActiveRateDisplay()

  const [showConfirmation, setShowConfirmation] = useState(false)

  const currenciesLoadingInProgress = false
  const allowsOffchainSigning = false
  const isTradePriceUpdating = false
  const showSetMax = true

  const priceImpact = usePriceImpact(useLimitOrdersPriceImpactParams())
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
    const { inputCurrencyId, outputCurrencyId } = state
    limitOrdersNavigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
  }, [state, limitOrdersNavigate, chainId])

  const onChangeRecipient = useCallback(
    (recipient: string | null) => {
      updateLimitOrdersState({ recipient })
    },
    [updateLimitOrdersState]
  )

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  return (
    <>
      <styledEl.Container>
        <styledEl.ContainerBox>
          <styledEl.Header>
            <TradeWidgetLinks />
            {isUnlocked && <SettingsWidget />}
          </styledEl.Header>

          {isUnlocked ? (
            <>
              <CurrencyInputPanel
                id="swap-currency-input"
                disableNonToken={true}
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
                <DeadlineInput />
              </styledEl.RateWrapper>
              <styledEl.CurrencySeparatorBox withRecipient={showRecipient}>
                <CurrencyArrowSeparator
                  isCollapsed={false}
                  onSwitchTokens={onSwitchTokens}
                  withRecipient={showRecipient}
                  isLoading={isTradePriceUpdating}
                  hasSeparatorLine={true}
                  border={true}
                />
                {showRecipient && <AddRecipient onChangeRecipient={onChangeRecipient} />}
              </styledEl.CurrencySeparatorBox>
              <CurrencyInputPanel
                id="swap-currency-output"
                disableNonToken={false}
                loading={currenciesLoadingInProgress}
                isRateLoading={isRateLoading}
                onCurrencySelection={onCurrencySelection}
                onUserInput={onUserInput}
                subsidyAndBalance={subsidyAndBalance}
                allowsOffchainSigning={allowsOffchainSigning}
                currencyInfo={outputCurrencyInfo}
                priceImpactParams={priceImpact}
                topLabel={outputCurrencyInfo.label}
              />
              {recipient !== null && (
                <styledEl.StyledRemoveRecipient recipient={recipient} onChangeRecipient={onChangeRecipient} />
              )}

              <styledEl.StyledRateInfo activeRateDisplay={activeRateDisplay} />

              <LimitOrdersWarnings priceImpact={priceImpact} />

              <styledEl.TradeButtonBox>
                <TradeButtons
                  tradeContext={tradeContext}
                  priceImpact={priceImpact}
                  openConfirmScreen={() => setShowConfirmation(true)}
                />
              </styledEl.TradeButtonBox>
            </>
          ) : (
            <UnlockLimitOrders handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })} />
          )}
        </styledEl.ContainerBox>
      </styledEl.Container>
      <TradeApproveWidget />
      {tradeContext && (
        <LimitOrdersConfirmModal
          isOpen={showConfirmation}
          tradeContext={tradeContext}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyInfo}
          outputCurrencyInfo={outputCurrencyInfo}
          onDismiss={() => setShowConfirmation(false)}
        />
      )}
      {chainId && <ImportTokenModal chainId={chainId} onDismiss={onImportDismiss} />}
    </>
  )
}
