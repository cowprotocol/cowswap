import { useAtomValue } from 'jotai'
import React, { isValidElement, ReactNode, useCallback, useEffect, useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSellOrder } from '@cowprotocol/common-utils'

import { i18n, MessageDescriptor } from '@lingui/core'
import { msg, t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useLocation } from 'react-router'

import { Field } from 'legacy/state/types'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import {
  TradeWidget,
  TradeWidgetSlots,
  useIsWrapOrUnwrap,
  useTradeConfirmState,
  useTradePriceImpact,
} from 'modules/trade'
import { UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
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
import { TradeRateDetails } from '../TradeRateDetails'

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  const { feeAmount } = useAtomValue(limitRateAtom)
  const { isLoading: isRateLoading } = useTradeQuote()
  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)
  const widgetActions = useLimitOrdersWidgetActions()

  const { showRecipient: showRecipientSetting, isUsdValuesMode } = settingsState
  const showRecipient = showRecipientSetting || !!recipient

  const priceImpact = useTradePriceImpact()
  const quoteAmount = useMemo(
    () => (isSell ? inputCurrencyAmount : outputCurrencyAmount),
    [isSell, inputCurrencyAmount, outputCurrencyAmount],
  )

  useSetTradeQuoteParams({ amount: quoteAmount })

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    label: isSell ? t`Sell` : t`You sell at most`,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: isSell,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
    isUsdValuesMode,
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    label: isSell ? t`Receive at least` : t`Buy exactly`,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: !isSell,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo: null,
    isUsdValuesMode,
  }

  const props: LimitOrdersProps = {
    inputCurrencyInfo,
    outputCurrencyInfo,
    isUnlocked,
    isRateLoading,
    showRecipient,
    recipient,
    rateInfoParams,
    priceImpact,
    settingsState,
    feeAmount,
    widgetActions,
  }

  return <LimitOrders {...props} />
}

const LIMIT_BULLET_LIST_CONTENT: Array<MessageDescriptor | ReactNode> = [
  msg`Set any limit price and time horizon`,
  msg`FREE order placement and cancellation`,
  msg`Place multiple orders using the same balance`,
  msg`Receive surplus of your order`,
  msg`Protection from MEV by default`,
  <span>
    <Trans>Place orders for higher than available balance!</Trans>
  </span>,
]

const UNLOCK_SCREEN = {
  title: msg`Want to try out limit orders?`,
  subtitle: msg`Get started!`,
  orderType: msg`partially fillable`,
  buttonText: msg`Get started with limit orders`,
  buttonLink: 'https://cow.fi/learn/cow-swap-improves-the-limit-order-experience-with-partially-fillable-limit-orders',
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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
    feeAmount,
  } = props

  const tradeContext = useTradeFlowContext()
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const localFormValidation = useLimitOrdersFormState()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()
  const { search } = useLocation()
  const handleUnlock = useCallback(() => updateLimitOrdersState({ isUnlocked: true }), [updateLimitOrdersState])
  const { isLimitOrdersUpgradeBannerEnabled } = useFeatureFlags()
  const isWrapUnwrap = useIsWrapOrUnwrap()

  useEffect(() => {
    const skipLockScreen = search.includes('skipLockScreen')

    if (skipLockScreen) {
      handleUnlock()
    }
  }, [search, handleUnlock])

  const isTradeContextReady = !!tradeContext

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

  const rateInput = isWrapUnwrap ? null : (
    <styledEl.RateWrapper>
      <RateInput />
    </styledEl.RateWrapper>
  )

  const slots: TradeWidgetSlots = {
    settingsWidget: <SettingsWidget />,
    lockScreen:
      !isUnlocked && !isLimitOrdersUpgradeBannerEnabled ? (
        <UnlockWidgetScreen
          id="limit-orders"
          items={LIMIT_BULLET_LIST_CONTENT.map((item) => ({
            content: isValidElement(item) ? item : i18n._(item as MessageDescriptor),
          }))}
          buttonLink={UNLOCK_SCREEN.buttonLink}
          title={i18n._(UNLOCK_SCREEN.title)}
          subtitle={i18n._(UNLOCK_SCREEN.subtitle)}
          orderType={i18n._(UNLOCK_SCREEN.orderType)}
          buttonText={i18n._(UNLOCK_SCREEN.buttonText)}
          handleUnlock={handleUnlock}
        />
      ) : undefined,
    topContent: props.settingsState.limitPricePosition === 'top' ? rateInput : undefined,
    middleContent: props.settingsState.limitPricePosition === 'between' ? rateInput : undefined,
    // TODO: Extract nested component outside render function
    // eslint-disable-next-line react/no-unstable-nested-components
    bottomContent(warnings) {
      return (
        <>
          {props.settingsState.limitPricePosition === 'bottom' && rateInput}
          <styledEl.FooterBox>
            <DeadlineInput />
            <TradeRateDetails rateInfoParams={rateInfoParams} alwaysExpanded={true} />
          </styledEl.FooterBox>

          <LimitOrdersWarnings feeAmount={feeAmount} />
          {warnings}

          <styledEl.TradeButtonBox>
            <TradeButtons isTradeContextReady={isTradeContextReady} />
          </styledEl.TradeButtonBox>
        </>
      )
    },
    outerContent: <>{isUnlocked && <InfoBanner />}</>,
  }

  const params = {
    compactView: true,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
    disablePriceImpact: localFormValidation === LimitOrdersFormState.FeeExceedsFrom,
    disableQuotePolling: isConfirmOpen,
    hideTradeWarnings: !!localFormValidation,
    isPriceStatic: true,
  }

  return (
    <TradeWidget
      slots={slots}
      actions={widgetActions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      confirmModal={
        tradeContext ? (
          <LimitOrdersConfirmModal
            recipient={recipient}
            tradeContext={tradeContext}
            priceImpact={priceImpact}
            inputCurrencyInfo={inputCurrencyPreviewInfo}
            outputCurrencyInfo={outputCurrencyPreviewInfo}
          />
        ) : null
      }
    />
  )
}, limitOrdersPropsChecker)
