import React, { useCallback } from 'react'
import { ReactNode } from 'react'

import { Field } from 'legacy/state/types'

import { SelectTokenWidget } from 'modules/tokensList'
import {
  TradeWidget,
  TradeWidgetSlots,
  useReceiveAmountInfo,
  useTradeConfirmState,
  useTradePriceImpact,
} from 'modules/trade'
import { UnlockWidgetScreen, BulletListItem } from 'modules/trade/pure/UnlockWidgetScreen'
import { useHandleSwap } from 'modules/tradeFlow'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab, TradeRateDetails } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'
import {
  useYieldDeadlineState,
  useYieldRecipientToggleState,
  useYieldSettings,
  useYieldUnlockState,
} from '../../hooks/useYieldSettings'
import { useYieldWidgetActions } from '../../hooks/useYieldWidgetActions'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'
import { YieldConfirmModal } from '../YieldConfirmModal'

const YIELD_BULLET_LIST_CONTENT: BulletListItem[] = [
  { content: 'Maximize your yield on existing LP positions' },
  { content: 'Seamlessly swap your tokens into CoW AMM pools' },
  { content: 'Earn higher returns with reduced impermanent loss' },
  { content: 'Leverage advanced strategies for optimal growth' },
]

const YIELD_UNLOCK_SCREEN = {
  id: 'yield-widget',
  title: 'Unlock Enhanced Yield Features',
  subtitle: 'Boooost your current LP positions with CoW AMM’s pools.',
  orderType: 'yield',
  buttonText: 'Start boooosting your yield!',
}

export function YieldWidget() {
  const { showRecipient } = useYieldSettings()
  const deadlineState = useYieldDeadlineState()
  const recipientToggleState = useYieldRecipientToggleState()
  const [isUnlocked, setIsUnlocked] = useYieldUnlockState()
  const { isLoading: isRateLoading } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()
  const widgetActions = useYieldWidgetActions()
  const receiveAmountInfo = useReceiveAmountInfo()

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
  } = useYieldDerivedState()
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }), widgetActions)

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: true,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
  }
  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: false,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo,
  }
  const inputCurrencyPreviewInfo = {
    amount: inputCurrencyInfo.amount,
    fiatAmount: inputCurrencyInfo.fiatAmount,
    balance: inputCurrencyInfo.balance,
    label: 'Sell amount',
  }

  const outputCurrencyPreviewInfo = {
    amount: outputCurrencyInfo.amount,
    fiatAmount: outputCurrencyInfo.fiatAmount,
    balance: outputCurrencyInfo.balance,
    label: 'Receive (before fees)',
  }

  const rateInfoParams = useRateInfoParams(inputCurrencyInfo.amount, outputCurrencyInfo.amount)

  const slots: TradeWidgetSlots = {
    selectTokenWidget: <SelectTokenWidget displayLpTokenLists />,
    settingsWidget: <SettingsTab recipientToggleState={recipientToggleState} deadlineState={deadlineState} />,
    bottomContent: useCallback(
      (tradeWarnings: ReactNode | null) => {
        return (
          <>
            <TradeRateDetails
              isTradePriceUpdating={isRateLoading}
              rateInfoParams={rateInfoParams}
              deadline={deadlineState[0]}
            />
            <Warnings />
            {tradeWarnings}
            <TradeButtons isTradeContextReady={doTrade.contextIsReady} />
          </>
        )
      },
      [doTrade.contextIsReady, isRateLoading, rateInfoParams, deadlineState],
    ),

    lockScreen: !isUnlocked ? (
      <UnlockWidgetScreen
        id={YIELD_UNLOCK_SCREEN.id}
        items={YIELD_BULLET_LIST_CONTENT}
        handleUnlock={() => setIsUnlocked(true)}
        title={YIELD_UNLOCK_SCREEN.title}
        subtitle={YIELD_UNLOCK_SCREEN.subtitle}
        orderType={YIELD_UNLOCK_SCREEN.orderType}
        buttonText={YIELD_UNLOCK_SCREEN.buttonText}
      />
    ) : undefined,
  }

  const params = {
    compactView: true,
    enableSmartSlippage: true,
    isMarketOrderWidget: true,
    recipient,
    showRecipient,
    isTradePriceUpdating: isRateLoading,
    priceImpact,
    disableQuotePolling: isConfirmOpen,
  }

  return (
    <TradeWidget
      disableOutput
      slots={slots}
      actions={widgetActions}
      params={params}
      inputCurrencyInfo={inputCurrencyInfo}
      outputCurrencyInfo={outputCurrencyInfo}
      confirmModal={
        doTrade.contextIsReady ? (
          <YieldConfirmModal
            doTrade={doTrade.callback}
            recipient={recipient}
            priceImpact={priceImpact}
            inputCurrencyInfo={inputCurrencyPreviewInfo}
            outputCurrencyInfo={outputCurrencyPreviewInfo}
          />
        ) : null
      }
    />
  )
}
