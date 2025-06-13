import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useLayoutEffect, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { renderTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { useReceiveAmountInfo } from 'modules/trade'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'
import { TwapFormState } from 'modules/twap/pure/PrimaryActionButton/getTwapFormState'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { usePrice } from 'common/hooks/usePrice'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import * as styledEl from './styled'
import { LABELS_TOOLTIPS } from './tooltips'

import {
  DEFAULT_NUM_OF_PARTS,
  DEFAULT_TWAP_SLIPPAGE,
  MAX_PART_TIME,
  MAX_TWAP_SLIPPAGE,
  MINIMUM_PART_TIME,
  ORDER_DEADLINES,
} from '../../const'
import {
  useFallbackHandlerVerification,
  useIsFallbackHandlerCompatible,
  useIsFallbackHandlerRequired,
} from '../../hooks/useFallbackHandlerVerification'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { AmountParts } from '../AmountParts'
import { TwapFormWarnings } from '../TwapFormWarnings'

export type { LabelTooltip, LabelTooltipItems } from './tooltips'

interface TwapFormWidget {
  tradeWarnings: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TwapFormWidget({ tradeWarnings }: TwapFormWidget) {
  const { account } = useWalletInfo()

  const { numberOfPartsValue, deadline, customDeadline, isCustomDeadline } = useAtomValue(twapOrdersSettingsAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { updateState } = useTradeState()
  const tradeQuote = useTradeQuote()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const isFallbackHandlerCompatible = useIsFallbackHandlerCompatible()
  const verification = useFallbackHandlerVerification()

  const twapOrderSlippage = useTwapSlippage()
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateSettingsState = useSetAtom(updateTwapOrdersSettingsAtom)

  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const receiveAmountInfo = useReceiveAmountInfo()

  const limitPriceAfterSlippage = usePrice(
    receiveAmountInfo?.afterSlippage.sellAmount,
    receiveAmountInfo?.afterSlippage.buyAmount,
  )

  const widgetDeadline = useInjectedWidgetDeadline(TradeType.ADVANCED)

  const cowAnalytics = useCowAnalytics()

  useEffect(() => {
    if (widgetDeadline) {
      // Ensure min part duration
      const minDuration = Math.floor(MINIMUM_PART_TIME / 60) * 2 // it must have at least 2 parts

      const maxDuration = Math.floor(MAX_PART_TIME / 60) * numberOfPartsValue

      let minutes = widgetDeadline
      if (widgetDeadline < minDuration) {
        minutes = minDuration
      } else if (widgetDeadline > maxDuration) {
        minutes = maxDuration
      }

      updateSettingsState({
        customDeadline: { hours: 0, minutes },
        isCustomDeadline: true,
      })
    }
  }, [widgetDeadline, updateSettingsState, numberOfPartsValue])

  const isDeadlineDisabled = !!widgetDeadline

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  // Reset warnings flags once on start
  useEffect(() => {
    updateSettingsState({ isFallbackHandlerSetupAccepted: false })
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.TWAP,
      action: 'Open Advanced Orders Tab',
    })
  }, [updateSettingsState, cowAnalytics])

  useEffect(() => {
    if (account && verification) {
      if (localFormValidation === TwapFormState.TX_BUNDLING_NOT_SUPPORTED) {
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.TWAP,
          action: 'non-compatible',
        })
      } else if (isFallbackHandlerRequired) {
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.TWAP,
          action: 'safe-that-could-be-converted',
        })
      } else if (isFallbackHandlerCompatible) {
        cowAnalytics.sendEvent({
          category: CowSwapAnalyticsCategory.TWAP,
          action: 'compatible',
        })
      }
    }
  }, [account, isFallbackHandlerRequired, isFallbackHandlerCompatible, localFormValidation, verification, cowAnalytics])

  // Reset output amount when quote params are changed
  useLayoutEffect(() => {
    if (tradeQuote.hasParamsChanged) {
      updateState?.({ outputCurrencyAmount: null })
    }
  }, [tradeQuote.hasParamsChanged, updateState])

  const isInvertedState = useState(false)
  const [isInverted] = isInvertedState

  const { onSlippageInput, onNumOfPartsInput } = useMemo(() => {
    return {
      onSlippageInput: (value: number | null) => updateSettingsState({ slippageValue: value }),
      onNumOfPartsInput: (value: number | null) => {
        updateSettingsState({ numberOfPartsValue: value || DEFAULT_NUM_OF_PARTS })
        updateState?.({ outputCurrencyAmount: null })
      },
    }
  }, [updateSettingsState, updateState])

  return (
    <>
      {!isWrapOrUnwrap && (
        <styledEl.Row>
          <styledEl.StyledRateInfo
            label={LABELS_TOOLTIPS.price.label}
            rateInfoParams={rateInfoParams}
            isInvertedState={isInvertedState}
          />
        </styledEl.Row>
      )}
      <TradeNumberInput
        value={+twapOrderSlippage.toFixed(2)}
        onUserInput={onSlippageInput}
        decimalsPlaces={2}
        placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
        min={0}
        max={MAX_TWAP_SLIPPAGE}
        label={LABELS_TOOLTIPS.slippage.label}
        tooltip={renderTooltip(LABELS_TOOLTIPS.slippage.tooltip)}
        showUpDownArrows={true}
        upDownArrowsLeftAlign={true}
        prefixComponent={
          <em>
            {limitPriceAfterSlippage ? (
              <styledEl.ExecutionPriceStyled
                executionPrice={limitPriceAfterSlippage}
                isInverted={isInverted}
                hideFiat
                hideSeparator
              />
            ) : (
              '0'
            )}
          </em>
        }
        suffix="%"
        step={0.1}
      />
      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={onNumOfPartsInput}
          min={DEFAULT_NUM_OF_PARTS}
          label={LABELS_TOOLTIPS.numberOfParts.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.numberOfParts.tooltip)}
          showUpDownArrows={true}
        />
      </styledEl.Row>

      <styledEl.Row>
        <DeadlineSelector
          deadline={deadlineState}
          isDeadlineDisabled={isDeadlineDisabled}
          items={ORDER_DEADLINES}
          setDeadline={updateSettingsState}
          label={LABELS_TOOLTIPS.totalDuration.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.totalDuration.tooltip, {
            parts: numberOfPartsValue,
            partDuration: timeInterval,
          })}
        />

        <TradeTextBox label={LABELS_TOOLTIPS.partDuration.label} tooltip={LABELS_TOOLTIPS.partDuration.tooltip}>
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.Row>

      <AmountParts />

      {tradeWarnings}
      <TwapFormWarnings localFormValidation={localFormValidation} />
      <ActionButtons
        fallbackHandlerIsNotSet={isFallbackHandlerRequired}
        localFormValidation={localFormValidation}
        primaryFormValidation={primaryFormValidation}
      />
    </>
  )
}
