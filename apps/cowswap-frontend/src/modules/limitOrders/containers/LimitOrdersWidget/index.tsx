import { useAtom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import React, { useMemo } from 'react'

import { OrderKind } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/swap/actions'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import { InfoBanner } from 'modules/limitOrders/pure/InfoBanner'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import { TradeWidget, useTradePriceImpact } from 'modules/trade'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { useSetTradeQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import * as styledEl from './styled'

import { useIsSellOrder } from '../../hooks/useIsSellOrder'
import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { updateLimitOrdersRawStateAtom } from '../../state/limitOrdersRawStateAtom'
import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { limitRateAtom } from '../../state/limitRateAtom'
import { DeadlineInput } from '../DeadlineInput'
import { LimitOrdersConfirmModal } from '../LimitOrdersConfirmModal'
import { RateInput } from '../RateInput'
import { SettingsWidget } from '../SettingsWidget'

export const LIMIT_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: 'Set any limit price and time horizon' },
  { content: 'FREE order placement and cancellation' },
  { content: 'Place multiple orders using the same balance' },
  { content: 'Always receive 100% of your order surplus' },
  { content: 'Protection from MEV by default' },
  {
    content: (
      <span>
        NOW with&nbsp;<b>partial fills</b>&nbsp;support!
      </span>
    ),
  },
]

const UNLOCK_SCREEN = {
  title: 'Want to try out limit orders?',
  subtitle: 'Get started!',
  orderType: 'partially fillable',
  buttonText: 'Get started with limit orders',
  buttonLink:
    'https://medium.com/@cow-protocol/cow-swap-improves-the-limit-order-experience-with-partially-fillable-limit-orders-45f19143e87d',
}

export function LimitOrdersWidget() {
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
  const partiallyFillableOverride = useAtom(partiallyFillableOverrideAtom)
  const { partialFillsEnabled } = useFeatureFlags()
  const widgetActions = useLimitOrdersWidgetActions()

  const { showRecipient, expertMode: isExpertMode } = settingsState

  const priceImpact = useTradePriceImpact()
  const quoteAmount = useMemo(
    () => (orderKind === OrderKind.SELL ? inputCurrencyAmount : outputCurrencyAmount),
    [orderKind, inputCurrencyAmount, outputCurrencyAmount]
  )

  useSetTradeQuoteParams(quoteAmount)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isSellOrder ? 'You sell' : 'You sell at most',
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: orderKind === OrderKind.SELL,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isSellOrder ? 'You receive at least' : 'You receive exactly',
    currency: outputCurrency,
    amount: outputCurrencyAmount,
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
    if (!inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, inputCurrency, outputCurrency])

  const isPartiallyFillable = featurePartialFillsEnabled && settingsState.partialFillsEnabled

  const updateLimitOrdersState = useSetAtom(updateLimitOrdersRawStateAtom)

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
      <UnlockWidgetScreen
        id="limit-orders"
        items={LIMIT_BULLET_LIST_CONTENT}
        buttonLink={UNLOCK_SCREEN.buttonLink}
        title={UNLOCK_SCREEN.title}
        subtitle={UNLOCK_SCREEN.subtitle}
        orderType={UNLOCK_SCREEN.orderType}
        buttonText={UNLOCK_SCREEN.buttonText}
        handleUnlock={() => updateLimitOrdersState({ isUnlocked: true })}
      />
    ),
    middleContent: (
      <styledEl.RateWrapper>
        <RateInput />
        <DeadlineInput />
      </styledEl.RateWrapper>
    ),
    bottomContent: (
      <>
        <styledEl.FooterBox>
          <styledEl.StyledRateInfo rateInfoParams={rateInfoParams} />
        </styledEl.FooterBox>

        {isExpertMode && (
          <styledEl.FooterBox>
            <styledEl.StyledOrderType
              isPartiallyFillable={isPartiallyFillable}
              partiallyFillableOverride={partiallyFillableOverride}
              featurePartialFillsEnabled={featurePartialFillsEnabled}
            />
          </styledEl.FooterBox>
        )}

        <LimitOrdersWarnings priceImpact={priceImpact} feeAmount={feeAmount} />

        <styledEl.TradeButtonBox>
          <TradeButtons tradeContext={tradeContext} priceImpact={priceImpact} />
        </styledEl.TradeButtonBox>
      </>
    ),
  }

  const params = {
    disableNonToken: false,
    compactView: false,
    disableNativeSelling: true,
    isExpertMode,
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
