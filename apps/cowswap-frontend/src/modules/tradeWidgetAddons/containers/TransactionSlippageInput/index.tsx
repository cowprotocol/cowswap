import { JSX, useContext } from 'react'

import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ThemeContext } from 'styled-components/macro'

import { useSmartSlippageFromQuote, useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useIsSmartSlippageApplied, useTradeSlippage } from 'modules/tradeSlippage'
import { SlippageWarningMessage } from 'modules/tradeWidgetAddons/pure/SlippageWarning'

import { useSlippageInput } from './hooks/useSlippageInput'
import { useSlippageWarningParams } from './hooks/useSlippageWarningParams'
import * as styledEl from './styled'
import { SlippageLoader } from './styled'

import { SlippageTooltip } from '../SlippageTooltip'

// eslint-disable-next-line max-lines-per-function
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
        <styledEl.OptionCustom
          active={isSlippageModified}
          warning={!!slippageError}
          tabIndex={-1}
          onClick={focusOnInput}
        >
          {!isSlippageModified && isQuoteLoading && !isInputFocused ? (
            <SlippageLoader size="16px" />
          ) : (
            <RowBetween>
              {slippageWarningParams &&
              !isQuoteLoading &&
              (slippageWarningParams.tooLow || slippageWarningParams?.tooHigh) ? (
                <styledEl.SlippageEmojiContainer>
                  <span role="img" aria-label={t`warning`}>
                    ⚠️
                  </span>
                </styledEl.SlippageEmojiContainer>
              ) : null}
              <styledEl.Input
                ref={inputRef}
                autoFocus={isInputFocused}
                placeholder={placeholderSlippage.toFixed(2)}
                value={slippageViewValue}
                onChange={(e) => parseSlippageInput(e.target.value)}
                onBlur={onSlippageInputBlur}
              />
              %
            </RowBetween>
          )}
        </styledEl.OptionCustom>
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
