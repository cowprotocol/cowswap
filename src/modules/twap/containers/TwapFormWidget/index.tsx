import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { useAdvancedOrdersDerivedState, useAdvancedOrdersRawState } from 'modules/advancedOrders'
import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { TradeNumberInput } from 'modules/trade/pure/TradeNumberInput'
import { TradeTextBox } from 'modules/trade/pure/TradeTextBox'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { QuoteObserverUpdater } from 'modules/twap/updaters/QuoteObserverUpdater'
import { useIsSafeApp, useWalletInfo } from 'modules/wallet'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'

import * as styledEl from './styled'

import { DEFAULT_TWAP_SLIPPAGE, defaultNumOfParts, orderDeadlines } from '../../const'
import { useTwapFormState } from '../../hooks/useTwapFormState'
import { AmountParts } from '../../pure/AmountParts'
import { DeadlineSelector } from '../../pure/DeadlineSelector'
import { NEED_FALLBACK_HANDLER_STATES } from '../../pure/PrimaryActionButton/getTwapFormState'
import { partsStateAtom } from '../../state/partsStateAtom'
import { twapTimeIntervalAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { TwapOrdersUpdater } from '../../updaters/TwapOrdersUpdater'
import { deadlinePartsDisplay } from '../../utils/deadlinePartsDisplay'
import { ActionButtons } from '../ActionButtons'
import { TwapConfirmModal } from '../TwapConfirmModal'
import { TwapFormWarnings } from '../TwapFormWarnings'

export function TwapFormWidget() {
  const { chainId, account } = useWalletInfo()
  const isSafeApp = useIsSafeApp()
  const { numberOfPartsValue, slippageValue, deadline, customDeadline, isCustomDeadline } =
    useAtomValue(twapOrdersSettingsAtom)

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { inputCurrencyAmount: rawInputCurrencyAmount } = useAdvancedOrdersRawState()
  const { updateState } = useTradeState()

  const partsState = useAtomValue(partsStateAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const updateSettingsState = useUpdateAtom(updateTwapOrdersSettingsAtom)

  const localFormValidation = useTwapFormState()
  const primaryFormValidation = useGetTradeFormValidation()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const composableCowContract = useComposableCowContract()

  const rateInfoParams = useRateInfoParams(inputCurrencyAmount, outputCurrencyAmount)

  const deadlineState = {
    deadline,
    customDeadline,
    isCustomDeadline,
  }

  const walletIsNotConnected = primaryFormValidation === TradeFormValidation.WalletNotConnected
  const fallbackHandlerIsNotSet = !!localFormValidation && NEED_FALLBACK_HANDLER_STATES.includes(localFormValidation)
  const shouldLoadTwapOrders = !!(isSafeApp && chainId && account && composableCowContract)

  // Reset output amount when num of parts or input amount are changed
  useEffect(() => {
    updateState?.({ outputCurrencyAmount: null })
  }, [updateState, numberOfPartsValue, rawInputCurrencyAmount])

  return (
    <>
      <QuoteObserverUpdater />
      {shouldLoadTwapOrders && (
        <TwapOrdersUpdater composableCowContract={composableCowContract} safeAddress={account} chainId={chainId} />
      )}
      <TwapConfirmModal fallbackHandlerIsNotSet={fallbackHandlerIsNotSet} />

      {!isWrapOrUnwrap && (
        <styledEl.Row>
          <styledEl.StyledRateInfo label="Current market price" rateInfoParams={rateInfoParams} />
        </styledEl.Row>
      )}

      <styledEl.Row>
        <TradeNumberInput
          value={numberOfPartsValue}
          onUserInput={(value: number | null) =>
            updateSettingsState({ numberOfPartsValue: value || defaultNumOfParts })
          }
          min={defaultNumOfParts}
          max={100}
          label="No. of parts"
          hint="Todo: No of parts hint"
        />
        <TradeNumberInput
          value={slippageValue}
          onUserInput={(value: number | null) => updateSettingsState({ slippageValue: value })}
          decimalsPlaces={2}
          placeholder={DEFAULT_TWAP_SLIPPAGE.toFixed(1)}
          max={50}
          label="Slippage"
          hint="Todo: Slippage hint"
          suffix="%"
        />
      </styledEl.Row>

      <AmountParts partsState={partsState} />

      <styledEl.DeadlineRow>
        <DeadlineSelector
          deadline={deadlineState}
          items={orderDeadlines}
          setDeadline={(value) => updateSettingsState(value)}
        />

        <TradeTextBox label="Part every" hint="TODO: part every tooltip">
          <>{deadlinePartsDisplay(timeInterval)}</>
        </TradeTextBox>
      </styledEl.DeadlineRow>

      <TwapFormWarnings localFormValidation={localFormValidation} walletIsNotConnected={walletIsNotConnected} />
      <ActionButtons
        localFormValidation={localFormValidation}
        primaryFormValidation={primaryFormValidation}
        walletIsNotConnected={walletIsNotConnected}
      />
    </>
  )
}
