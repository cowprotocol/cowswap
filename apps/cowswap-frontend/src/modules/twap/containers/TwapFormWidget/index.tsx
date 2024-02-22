import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo, useState } from 'react'

import { openAdvancedOrdersTabAnalytics, twapWalletCompatibilityAnalytics } from '@cowprotocol/analytics'
import { renderTooltip } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState, useAdvancedOrdersRawState } from 'modules/advancedOrders'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TwapFormState } from 'modules/twap/pure/PrimaryActionButton/getTwapFormState'

import { usePrice } from 'common/hooks/usePrice'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'

import * as styledEl from './styled'
import { AMOUNT_PARTS_LABELS, LABELS_TOOLTIPS } from './tooltips'

import { DEFAULT_NUM_OF_PARTS, DEFAULT_TWAP_SLIPPAGE, MAX_TWAP_SLIPPAGE, ORDER_DEADLINES } from '../../const'
import {
  useFallbackHandlerVerification,
  useIsFallbackHandlerCompatible,
  useIsFallbackHandlerRequired,
} from '../../hooks/useFallbackHandlerVerification'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapSlippageAdjustedBuyAmount, twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import {
  twapOrderSlippageAtom,
  twapOrdersSettingsAtom,
  updateTwapOrdersSettingsAtom,
} from '../../state/twapOrdersSettingsAtom'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { TwapFormWarnings } from '../TwapFormWarnings'

export type { LabelTooltip, LabelTooltipItems } from './tooltips'

export function TwapFormWidget() {
  const { account } = useWalletInfo()

  const { numberOfPartsValue, deadline, customDeadline, isCustomDeadline } = useAtomValue(twapOrdersSettingsAtom)
  const buyAmount = useAtomValue(twapSlippageAdjustedBuyAmount)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { inputCurrencyAmount: rawInputCurrencyAmount } = useAdvancedOrdersRawState()
  const { updateState } = useTradeState()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const isFallbackHandlerCompatible = useIsFallbackHandlerCompatible()
  const verification = useFallbackHandlerVerification()

  const twapOrderSlippage = useAtomValue(twapOrderSlippageAtom)
  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateSettingsState = useSetAtom(updateTwapOrdersSettingsAtom)

  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const limitPrice = usePrice(inputCurrencyAmount, buyAmount)

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  // Reset output amount when num of parts or input amount are changed
  useEffect(() => {
    updateState?.({ outputCurrencyAmount: null })
  }, [updateState, numberOfPartsValue, rawInputCurrencyAmount])

  // Reset warnings flags once on start
  useEffect(() => {
    updateSettingsState({ isFallbackHandlerSetupAccepted: false, isPriceImpactAccepted: false })
    openAdvancedOrdersTabAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (account && verification) {
      if (localFormValidation === TwapFormState.NOT_SAFE) {
        twapWalletCompatibilityAnalytics('non-compatible')
      } else if (isFallbackHandlerRequired) {
        twapWalletCompatibilityAnalytics('safe-that-could-be-converted')
      } else if (isFallbackHandlerCompatible) {
        twapWalletCompatibilityAnalytics('compatible')
      }
    }
  }, [account, isFallbackHandlerRequired, isFallbackHandlerCompatible, localFormValidation, verification])

  const isInvertedState = useState(false)
  const [isInverted] = isInvertedState

  const { onSlippageInput, onNumOfPartsInput } = useMemo(() => {
    return {
      onSlippageInput: (value: number | null) => updateSettingsState({ slippageValue: value }),
      onNumOfPartsInput: (value: number | null) => {
        updateSettingsState({ numberOfPartsValue: value || DEFAULT_NUM_OF_PARTS })
      },
    }
  }, [updateSettingsState])

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
            {limitPrice ? (
              <ExecutionPrice executionPrice={limitPrice} isInverted={isInverted} hideFiat hideSeparator />
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
          items={ORDER_DEADLINES}
          setDeadline={(value) => updateSettingsState(value)}
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

      <AmountParts partsState={partsState} labels={AMOUNT_PARTS_LABELS} />

      <TwapFormWarnings localFormValidation={localFormValidation} />
      <ActionButtons
        fallbackHandlerIsNotSet={isFallbackHandlerRequired}
        localFormValidation={localFormValidation}
        primaryFormValidation={primaryFormValidation}
      />
    </>
  )
}
