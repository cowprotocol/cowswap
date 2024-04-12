import { useAtomValue } from 'jotai'
import React, { useMemo } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import { TradeWidget, useTradePriceImpact } from 'modules/trade'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useSetTradeQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { LimitOrdersProps, limitOrdersPropsChecker } from './limitOrdersPropsChecker'
import * as styledEl from './styled'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { LimitOrdersFormState, useLimitOrdersFormState } from '../../hooks/useLimitOrdersFormState'
import { useUpdateLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { useTradeFlowContext } from '../../hooks/useTradeFlowContext'
import { InfoBanner } from '../../pure/InfoBanner'
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
  { content: 'Receive surplus of your order' },
  { content: 'Protection from MEV by default' },
  {
    content: <span>Place orders for higher than available balance!</span>,
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
  const isSell = isSellOrder(orderKind)
  const tradeContext = useTradeFlowContext()
  const { feeAmount } = useAtomValue(limitRateAtom)
  const { isLoading: isRateLoading } = useTradeQuote()
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const widgetActions = useLimitOrdersWidgetActions()

  const { showRecipient: showRecipientSetting } = settingsState
  const showRecipient = showRecipientSetting || !!recipient

  const priceImpact = useTradePriceImpact()
  const quoteAmount = useMemo(
    () => (isSell ? inputCurrencyAmount : outputCurrencyAmount),
    [isSell, inputCurrencyAmount, outputCurrencyAmount]
  )

  useSetTradeQuoteParams(quoteAmount)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isSell ? 'Sell amount' : 'You sell at most',
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: isSell,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isSell ? 'Receive at least' : 'Buy exactly',
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: !isSell,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }

  const localFormValidation = useLimitOrdersFormState()
  const primaryFormValidation = useGetTradeFormValidation()

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    showRecipient,
    recipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
    settingsState,
    feeAmount,
    widgetActions,
    localFormValidation,
    primaryFormValidation,
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
    showRecipient,
    recipient,
    rateInfoParams,
    priceImpact,
    tradeContext,
    feeAmount,
    localFormValidation,
    primaryFormValidation,
  } = props

  const inputCurrency = inputCurrencyInfo.currency
  const outputCurrency = outputCurrencyInfo.currency

  const isTradePriceUpdating = useMemo(() => {
    if (!inputCurrency || !outputCurrency) return false

    return isRateLoading
  }, [isRateLoading, inputCurrency, outputCurrency])

  const updateLimitOrdersState = useUpdateLimitOrdersRawState()

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

        <LimitOrdersWarnings feeAmount={feeAmount} />

        <styledEl.TradeButtonBox>
          <TradeButtons tradeContext={tradeContext} priceImpact={priceImpact} />
        </styledEl.TradeButtonBox>
      </>
    ),
    outerContent: <>{isUnlocked && <InfoBanner />}</>,
  }

  const disablePriceImpact =
    localFormValidation === LimitOrdersFormState.FeeExceedsFrom ||
    primaryFormValidation === TradeFormValidation.QuoteErrors ||
    primaryFormValidation === TradeFormValidation.CurrencyNotSupported ||
    primaryFormValidation === TradeFormValidation.WrapUnwrapFlow

  const params = {
    compactView: false,
    recipient,
    showRecipient,
    isTradePriceUpdating,
    priceImpact,
    disablePriceImpact,
  }

  return (
    <TradeWidget
      slots={slots}
      actions={widgetActions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      confirmModal={tradeContext && (
        <LimitOrdersConfirmModal
          recipient={recipient}
          tradeContext={tradeContext}
          priceImpact={priceImpact}
          inputCurrencyInfo={inputCurrencyPreviewInfo}
          outputCurrencyInfo={outputCurrencyPreviewInfo}
        />
      )}
    />
  )
}, limitOrdersPropsChecker)
