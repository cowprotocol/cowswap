import { ReactNode, useCallback, useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { Field } from 'legacy/state/types'

import { SelectTokenWidget } from 'modules/tokensList'
import {
  TradeWidget,
  TradeWidgetSlots,
  useReceiveAmountInfo,
  useTradeConfirmState,
  useTradePriceImpact,
} from 'modules/trade'
import { useHandleSwap } from 'modules/tradeFlow'
import { useTradeQuote } from 'modules/tradeQuote'
import { SettingsTab, TradeRateDetails } from 'modules/tradeWidgetAddons'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { useSafeMemoObject } from 'common/hooks/useSafeMemo'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import { CoWAmmInlineBanner } from './CoWAmmInlineBanner'

import { usePoolsInfo } from '../../hooks/usePoolsInfo'
import { useYieldDerivedState } from '../../hooks/useYieldDerivedState'
import { useYieldDeadlineState, useYieldRecipientToggleState, useYieldSettings } from '../../hooks/useYieldSettings'
import { useYieldWidgetActions } from '../../hooks/useYieldWidgetActions'
import { PoolApyPreview } from '../../pure/PoolApyPreview'
import { TargetPoolPreviewInfo } from '../../pure/TargetPoolPreviewInfo'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'
import { YieldConfirmModal } from '../YieldConfirmModal'

export function YieldWidget() {
  const { showRecipient } = useYieldSettings()
  const deadlineState = useYieldDeadlineState()
  const recipientToggleState = useYieldRecipientToggleState()
  const { isLoading: isRateLoading } = useTradeQuote()
  const priceImpact = useTradePriceImpact()
  const { isOpen: isConfirmOpen } = useTradeConfirmState()
  const widgetActions = useYieldWidgetActions()
  const receiveAmountInfo = useReceiveAmountInfo()
  const poolsInfo = usePoolsInfo()

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
  const doTrade = useHandleSwap(useSafeMemoObject({ deadline: deadlineState[0] }))

  const inputPoolState = useMemo(() => {
    if (!poolsInfo || !inputCurrency) return null

    return poolsInfo[getCurrencyAddress(inputCurrency).toLowerCase()]
  }, [inputCurrency, poolsInfo])

  const outputPoolState = useMemo(() => {
    if (!poolsInfo || !outputCurrency) return null

    return poolsInfo[getCurrencyAddress(outputCurrency).toLowerCase()]
  }, [outputCurrency, poolsInfo])

  const inputApy = inputPoolState?.info.apy
  const outputApy = outputPoolState?.info.apy

  const inputCurrencyInfo: CurrencyInfo = {
    field: Field.INPUT,
    currency: inputCurrency,
    amount: inputCurrencyAmount,
    isIndependent: true,
    balance: inputCurrencyBalance,
    fiatAmount: inputCurrencyFiatAmount,
    receiveAmountInfo: null,
    topContent: (
      <div>
        <PoolApyPreview apy={inputApy} isSuperior={Boolean(inputApy && outputApy && inputApy > outputApy)} />
      </div>
    ),
  }

  const outputCurrencyInfo: CurrencyInfo = {
    field: Field.OUTPUT,
    currency: outputCurrency,
    amount: outputCurrencyAmount,
    isIndependent: false,
    balance: outputCurrencyBalance,
    fiatAmount: outputCurrencyFiatAmount,
    receiveAmountInfo,
    topContent: inputCurrency ? (
      <TargetPoolPreviewInfo sellToken={inputCurrency}>
        <PoolApyPreview apy={outputApy} isSuperior={Boolean(inputApy && outputApy && outputApy > inputApy)} />
      </TargetPoolPreviewInfo>
    ) : null,
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
    topContent: CoWAmmInlineBanner,
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
  }

  const params = {
    compactView: true,
    enableSmartSlippage: true,
    displayTokenName: true,
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
