import { useAtomValue } from 'jotai'
import React, { useMemo } from 'react'

import ICON_TOKENS from '@cowprotocol/assets/svg/tokens.svg'
import { isSellOrder } from '@cowprotocol/common-utils'
import { BannerOrientation, ClosableBanner, InlineBanner } from '@cowprotocol/ui'

import { Field } from 'legacy/state/types'

import { LimitOrdersWarnings } from 'modules/limitOrders/containers/LimitOrdersWarnings'
import { useLimitOrdersWidgetActions } from 'modules/limitOrders/containers/LimitOrdersWidget/hooks/useLimitOrdersWidgetActions'
import { TradeButtons } from 'modules/limitOrders/containers/TradeButtons'
import { TradeWidget, TradeWidgetSlots, useIsWrapOrUnwrap, useTradePriceImpact } from 'modules/trade'
import { useTradeConfirmState } from 'modules/trade'
import { BulletListItem, UnlockWidgetScreen } from 'modules/trade/pure/UnlockWidgetScreen'
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

const ZERO_BANNER_STORAGE_KEY = 'limitOrdersZeroBalanceBanner:v0'

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
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const { showRecipient: showRecipientSetting } = settingsState
  const showRecipient = showRecipientSetting || !!recipient

  const priceImpact = useTradePriceImpact()
  const quoteAmount = useMemo(
    () => (isSell ? inputCurrencyAmount : outputCurrencyAmount),
    [isSell, inputCurrencyAmount, outputCurrencyAmount],
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
    isWrapOrUnwrap,
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
    feeAmount,
    isWrapOrUnwrap,
  } = props

  const tradeContext = useTradeFlowContext()
  const updateLimitOrdersState = useUpdateLimitOrdersRawState()
  const localFormValidation = useLimitOrdersFormState()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()

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

  const slots: TradeWidgetSlots = {
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
      <>
        {!isWrapOrUnwrap &&
          ClosableBanner(ZERO_BANNER_STORAGE_KEY, (onClose) => (
            <InlineBanner
              bannerType="success"
              orientation={BannerOrientation.Horizontal}
              customIcon={ICON_TOKENS}
              iconSize={32}
              onClose={onClose}
            >
              <p>
                <b>NEW: </b>You can now place limit orders for amounts larger than your wallet balance. Partial fill
                orders will execute until you run out of sell tokens. Fill-or-kill orders will become active once you
                top up your balance.
              </p>
            </InlineBanner>
          ))}
        <styledEl.RateWrapper>
          <RateInput />
          <DeadlineInput />
        </styledEl.RateWrapper>
      </>
    ),
    bottomContent(warnings) {
      return (
        <>
          <styledEl.FooterBox>
            <TradeRateDetails rateInfoParams={rateInfoParams} />
          </styledEl.FooterBox>

          <LimitOrdersWarnings feeAmount={feeAmount} />
          {warnings}

          <styledEl.TradeButtonBox>
            <TradeButtons isTradeContextReady={!!tradeContext} />
          </styledEl.TradeButtonBox>
        </>
      )
    },
    outerContent: <>{isUnlocked && <InfoBanner />}</>,
  }

  const params = {
    compactView: false,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
    disablePriceImpact: localFormValidation === LimitOrdersFormState.FeeExceedsFrom,
    disableQuotePolling: isConfirmOpen,
    hideTradeWarnings: !!localFormValidation,
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
