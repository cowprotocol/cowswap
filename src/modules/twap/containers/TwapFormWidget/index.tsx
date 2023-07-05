import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useState } from 'react'

import { renderTooltip } from 'legacy/components/Tooltip'

import { useAdvancedOrdersDerivedState, useAdvancedOrdersRawState } from 'modules/advancedOrders'
import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { QuoteObserverUpdater } from 'modules/twap/updaters/QuoteObserverUpdater'
import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { usePrice } from 'common/hooks/usePrice'
import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import { ExecutionPrice } from 'common/pure/ExecutionPrice'

import * as styledEl from './styled'
import { AMOUNT_PARTS_LABELS, LABELS_TOOLTIPS } from './tooltips'

import { DEFAULT_TWAP_SLIPPAGE, defaultNumOfParts, orderDeadlines } from '../../const'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapOrderAtom, twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { FallbackHandlerVerificationUpdater } from '../../updaters/FallbackHandlerVerificationUpdater'
import { TwapOrdersUpdater } from '../../updaters/TwapOrdersUpdater'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { TwapConfirmModal } from '../TwapConfirmModal'
import { TwapFormWarnings } from '../TwapFormWarnings'

export type { LabelTooltip, LabelTooltipItems } from './tooltips'

export function TwapFormWidget() {
  const { chainId, account } = useWalletInfo()
  const isSafeApp = useIsSafeApp()
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)
  const twapOrder = useAtomValue(twapOrderAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { inputCurrencyAmount: rawInputCurrencyAmount } = useAdvancedOrdersRawState()
  const { updateState } = useTradeState()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()

  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateSettingsState = useUpdateAtom(updateTwapOrdersSettingsAtom)

  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const composableCowContract = useComposableCowContract()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const limitPrice = usePrice(inputCurrencyAmount, twapOrder?.buyAmount)

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  const shouldLoadTwapOrders = !!(isSafeApp && chainId && account && composableCowContract)

  // Reset output amount when num of parts or input amount are changed
  useEffect(() => {
    updateState?.({ outputCurrencyAmount: null })
  }, [updateState, numberOfPartsValue, rawInputCurrencyAmount])

  // Reset warnings flags once on start
  useEffect(() => {
    updateSettingsState({ isFallbackHandlerSetupAccepted: false, isPriceImpactAccepted: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isInvertedState = useState(false)
  const [isInverted] = isInvertedState

  return (
    <>
      <QuoteObserverUpdater />
      <FallbackHandlerVerificationUpdater />
      {shouldLoadTwapOrders && (
        <TwapOrdersUpdater composableCowContract={composableCowContract} safeAddress={account} chainId={chainId} />
      )}
      <TwapConfirmModal fallbackHandlerIsNotSet={isFallbackHandlerRequired} />

      {!isWrapOrUnwrap && (
        <styledEl.Row>
          <styledEl.StyledRateInfo label={LABELS_TOOLTIPS.price.label} rateInfoParams={rateInfoParams} />
        </styledEl.Row>
      )}
      <TradeNumberInput
        value={slippageValue}
        onUserInput={(value: number | null) => updateSettingsState({ slippageValue: value })}
        decimalsPlaces={2}
        placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
        max={50}
        label={LABELS_TOOLTIPS.slippage.label}
        tooltip={renderTooltip(LABELS_TOOLTIPS.slippage.tooltip)}
        prefixComponent={
          <em>
            {limitPrice ? (
              <ExecutionPrice executionPrice={limitPrice} isInverted={isInverted} hideFiat hideSeparator />
            ) : (
              '-'
            )}
          </em>
        }
        suffix="%"
      />
      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(value: number | null) =>
            updateSettingsState({ numberOfPartsValue: value || defaultNumOfParts })
          }
          min={defaultNumOfParts}
          max={100}
          label={LABELS_TOOLTIPS.numberOfParts.label}
          tooltip={renderTooltip(LABELS_TOOLTIPS.numberOfParts.tooltip)}
        />
      </styledEl.Row>

      <styledEl.Row>
        <DeadlineSelector
          deadline={deadlineState}
          items={orderDeadlines}
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
      <ActionButtons localFormValidation={localFormValidation} primaryFormValidation={primaryFormValidation} />
    </>
  )
}
