import { JSX, ReactNode } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { SettingsInput, Loader, SettingsFeedback } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { useIsEoaEthFlow } from 'modules/trade'
import { useSmartSlippageFromQuote, useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'

import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { useSlippageInput } from './hooks/useSlippageInput'
import { useSlippageWarningParams } from './hooks/useSlippageWarningParams'
import * as styledEl from './TransactionSlippageInput.styled'

export function TransactionSlippageInput(): JSX.Element {
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const { isLoading: isQuoteLoading } = useTradeQuote()
  const swapSlippage = useTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippageFromQuote = useSmartSlippageFromQuote()

  const isSlippageModified = useIsSlippageModified()

  const slippageWarningParams = useSlippageWarningParams(swapSlippage, smartSlippageFromQuote, isSlippageModified)

  const {
    slippageError,
    slippageViewValue,
    parseSlippageInput,
    placeholderSlippage,
    onSlippageInputBlur,
    setAutoSlippage,
  } = useSlippageInput()

  const autoButton = (
    <styledEl.AutoButton onClick={setAutoSlippage} active={!isSlippageModified}>
      <Trans>Auto</Trans>
      {!isSlippageModified && isQuoteLoading ? <Loader size="16px" /> : null}
    </styledEl.AutoButton>
  )

  // Note that we set the value of footerSlot regardless of isQuoteLoading state to prevent so many quick changes/flashes
  // in the UI. Typically, slippage values from one quote to the next are going to be similar, so most likely, the UI
  // will remain the same.
  //
  // In those cases where that's not the case, the small delay will be almost imperceptible. Also, keep in mind when
  // slippage = Auto, the Auto button does show a Loader anyway.
  let footerSlot: ReactNode | null = null

  if (isSmartSlippageApplied) {
    footerSlot = (
      <SettingsFeedback
        variant="info"
        message="Dynamic"
        tooltip={t`CoW Swap has dynamically selected this slippage amount to account for current gas prices and trade size. Changes may result in slower execution.`}
      />
    )
  } else if (slippageWarningParams) {
    let message: string = t`Enter slippage percentage between ${slippageWarningParams.min}% and ${slippageWarningParams.max}%`

    if (!slippageError) {
      if (slippageWarningParams.tooLow) {
        message = t`Your transaction may expire`
      } else if (slippageWarningParams.tooHigh) {
        message = t`High slippage amount selected`
      }
    }

    footerSlot = (
      <SettingsFeedback
        variant={slippageError ? 'error' : 'warning'}
        message={message}
        tooltip={t`Enter slippage percentage between ${slippageWarningParams.min}% and ${slippageWarningParams.max}%`}
      />
    )
  }

  return (
    <SettingsInput
      id="slippage-input"
      label={t`MEV-protected slippage`}
      tooltip={
        isEoaEthFlow
          ? getNativeSlippageTooltip([nativeCurrency.symbol, getWrappedToken(nativeCurrency).symbol])
          : getNonNativeSlippageTooltip({ isDynamic: isSmartSlippageApplied, isSettingsModal: true })
      }
      placeholder={placeholderSlippage.toFixed(2)}
      value={slippageViewValue}
      unit="%"
      onChange={(e) => parseSlippageInput(e.target.value)}
      onBlur={onSlippageInputBlur}
      // disabled={isDisabled}
      error={!!slippageError}
      leftSlot={autoButton}
      footerSlot={footerSlot}
    />
  )
}
