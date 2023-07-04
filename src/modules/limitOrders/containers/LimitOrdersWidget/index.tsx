import { useAtom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import React, { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import { useSetupLimitOrderAmountsFromUrl } from 'modules/limitOrders/hooks/useSetupLimitOrderAmountsFromUrl'
import { InfoBanner } from 'modules/limitOrders/pure/InfoBanner'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeWidget, useSetupTradeState, useTradePriceImpact } from 'modules/trade'
import { useDisableNativeTokenSelling } from 'modules/trade/hooks/useDisableNativeTokenSelling'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useSetTradeQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import * as styledEl from './styled'

import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { useFillLimitOrdersDerivedState, useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { UnlockLimitOrders } from '../../pure/UnlockLimitOrders'
import { updateLimitOrdersRawStateAtom } from '../../state/limitOrdersRawStateAtom'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { limitRateAtom } from '../../state/limitRateAtom'
import { DeadlineInput } from '../DeadlineInput'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { RateInput } from '../RateInput'
import { SettingsWidget } from '../SettingsWidget'

export function LimitOrdersWidget() {
  useSetupTradeState()
  useSetupLimitOrderAmountsFromUrl()
  useDisableNativeTokenSelling()
  useFillLimitOrdersDerivedState()

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
    orderKind,
  } = useLimitOrdersDerivedState()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const isSellOrder = useIsSellOrder()
  const tradeContext = useTradeFlowContext()
  const { feeAmount } = useAtomValue(limitRateAtom)
  const { isLoading: isRateLoading } = useTradeQuote()
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()
  const widgetActions = useLimitOrdersWidgetActions()

  const showRecipient = useMemo(
    () => !isWrapOrUnwrap && settingsState.showRecipient,
    [settingsState.showRecipient, isWrapOrUnwrap]
  )

  const isExpertMode = useMemo(
    () => !isWrapOrUnwrap && settingsState.expertMode,
    [isWrapOrUnwrap, settingsState.expertMode]
  )

  const priceImpact = useTradePriceImpact()
  const quoteAmount = useMemo(
    () => (orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount),
    [orderKind, inputCurrencyAmount, outputCurrencyAmount]
  )

  useSetTradeQuoteParams(quoteAmount)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isWrapOrUnwrap ? undefined : isSellOrder ? 'You receive at least' : 'You receive exactly',
    currency: outputCurrency,
    amount: isWrapOrUnwrap ? inputCurrencyAmount : outputCurrencyAmount,
    isIndependent: orderKind === OrderKind.BUY,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    partiallyFillableOverride,
    featurePartialFillsEnabled: partialFillsEnabled,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
    widgetActions,
  }

  return <LimitOrders {...props} />
}

const LimitOrders = React.memo((props: LimitOrdersProps) => {
  const {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    widgetActions,
    partiallyFillableOverride,
    featurePartialFillsEnabled,
    isWrapOrUnwrap,
    showRecipient,
    isExpertMode,
    recipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
  } = props

  const inputCurrency = inputCurrencyInfo.currency
  const outputCurrency = outputCurrencyInfo.currency

  const isTradePriceUpdating = useMemo(() => {
    if (isWrapOrUnwrap || !inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, isWrapOrUnwrap, inputCurrency, outputCurrency])

  const isPartiallyFillable = featurePartialFillsEnabled && settingsState.partialFillsEnabled

  const updateLimitOrdersState = useUpdateAtom(updateLimitOrdersRawStateAtom)

  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: inputCurrencyInfo.label,
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: outputCurrencyInfo.label,
  }

  console.debug('RENDER LIMIT ORDERS WIDGET', { inputCurrencyInfo, outputCurrencyInfo })

  const slots = {
    settingsWidget: <SettingsWidget />,
    lockScreen: isUnlocked ? undefined : (
      <UnlockLimitOrders handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })} />
    ),
    middleContent: (
      <styledEl.RateWrapper>
        <RateInput />
        <DeadlineInput />
      </styledEl.RateWrapper>
    ),
    bottomContent: (
      <>
        {!isWrapOrUnwrap && (
          <styledEl.FooterBox>
            <styledEl.StyledRateInfo rateInfoParams={rateInfoParams} />
          </styledEl.FooterBox>
        )}

        {isExpertMode && (
          <styledEl.FooterBox>
            <styledEl.StyledOrderType
              isPartiallyFillable={isPartiallyFillable}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={featurePartialFillsEnabled}
            />
          </styledEl.FooterBox>
        )}

        {!isWrapOrUnwrap && <LimitOrdersWarnings priceImpact={priceImpact} feeAmount={feeAmount} />}

        <styledEl.TradeButtonBox>
          <TradeButtons tradeContext={tradeContext} priceImpact={priceImpact} />
        </styledEl.TradeButtonBox>
      </>
    ),
  }

  const params = {
    disableNonToken: false,
    compactView: false,
    recipient,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    isRateLoading,
  }

  return (
    <>
      <TradeWidget
        slots={slots}
        actions={widgetActions}
        params={params}
        inputCurrencyInfo={inputCurrencyInfo}
        outputCurrencyInfo={outputCurrencyInfo}
      />
      {tradeContext && (
        <LimitOrdersConfirmModal
          tradeContext={tradeContext}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyPreviewInfo}
          outputCurrencyInfo={outputCurrencyPreviewInfo}
        />
      )}
      {isUnlocked && <InfoBanner />}
    </>
  )
}, limitOrdersPropsChecker)
