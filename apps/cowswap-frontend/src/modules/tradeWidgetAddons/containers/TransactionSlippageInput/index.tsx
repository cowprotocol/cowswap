import { JSX, useContext } from 'react'

import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { ThemeContext } from 'styled-components/macro'

import { useSmartSlippageFromQuote, useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'
import { SlippageWarningMessage } from 'modules/tradeWidgetAddons/pure/SlippageWarning'

import { useSlippageInput } from './hooks/useSlippageInput'
import { useSlippageWarningParams } from './hooks/useSlippageWarningParams'
import { Input } from './Input'
import * as styledEl from './styled'

import { SlippageTooltip } from '../SlippageTooltip'

export function TransactionSlippageInput(): JSX.Element {
  const theme = useContext(ThemeContext)

  const { isLoading: isQuoteLoading } = useTradeQuote()
  const swapSlippage = useTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippageFromQuote = useSmartSlippageFromQuote()

  const isSlippageModified = useIsSlippageModified()

  const slippageWarningParams = useSlippageWarningParams(swapSlippage, smartSlippageFromQuote, isSlippageModified)

  const {
    slippageError,
    slippageViewValue,
    isInputFocused,
    parseSlippageInput,
    placeholderSlippage,
    onSlippageInputBlur,
    setAutoSlippage,
    focusOnInput,
    inputRef,
  } = useSlippageInput()

  return (
    <>
      <RowFixed>
        <SlippageTooltip />
      </RowFixed>
      <RowBetween>
        <styledEl.Option onClick={setAutoSlippage} active={!isSlippageModified}>
          <Trans>Auto</Trans>
        </styledEl.Option>
        <Input
          isSlippageModified={isSlippageModified}
          slippageError={slippageError}
          focusOnInput={focusOnInput}
          isQuoteLoading={isQuoteLoading}
          isInputFocused={isInputFocused}
          slippageWarningParams={slippageWarningParams}
          inputRef={inputRef}
          slippageViewValue={slippageViewValue}
          parseSlippageInput={parseSlippageInput}
          onSlippageInputBlur={onSlippageInputBlur}
          placeholderSlippage={placeholderSlippage.toFixed(2)}
        />
      </RowBetween>
      {slippageWarningParams && !isQuoteLoading && (
        <SlippageWarningMessage error={!!slippageError} theme={theme} slippageWarningParams={slippageWarningParams} />
      )}
      {isSmartSlippageApplied && !isQuoteLoading && (
        <RowBetween>
          <styledEl.SmartSlippageInfo>
            <HelpTooltip
              text={
                <Trans>
                  CoW Swap has dynamically selected this slippage amount to account for current gas prices and trade
                  size. Changes may result in slower execution.
                </Trans>
              }
            />
            <span>
              <Trans>Dynamic</Trans>
            </span>
          </styledEl.SmartSlippageInfo>
        </RowBetween>
      )}
    </>
  )
}
