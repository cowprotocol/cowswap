import { JSX, useContext } from 'react'


import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'

import { useSmartSlippageFromQuote } from 'modules/tradeQuote'
import {
  useIsSlippageModified,
  useIsSmartSlippageApplied,
  useTradeSlippage
} from 'modules/tradeSlippage'
import { SlippageWarningMessage } from 'modules/tradeWidgetAddons/pure/SlippageWarning'

import { useSlippageInput } from './hooks/useSlippageInput'
import { useSlippageWarningParams } from './hooks/useSlippageWarningParams'
import * as styledEl from './styled'

import { SlippageTooltip } from '../SlippageTooltip'

export function TransactionSlippageInput(): JSX.Element {
  const theme = useContext(ThemeContext)

  const swapSlippage = useTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSlippageFromQuote()

  const chosenSlippageMatchesSmartSlippage = smartSlippage !== null && new Percent(smartSlippage, 10_000).equalTo(swapSlippage)
  const isSlippageModified = useIsSlippageModified()

  const showSlippageWarning = !isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage

  const {
    tooLow,
    tooHigh,
    min,
    max
  } = useSlippageWarningParams(swapSlippage, smartSlippage, isSlippageModified)

  const {
    slippageError,
    slippageViewValue,
    parseSlippageInput,
    placeholderSlippage,
    onSlippageInputBlur,
    setAutoSlippage
  } = useSlippageInput()

  return (
    <>
      <RowFixed>
        <SlippageTooltip/>
      </RowFixed>
      <RowBetween>
        <styledEl.Option
          onClick={setAutoSlippage}
          active={!isSlippageModified}
        >
          <Trans>Auto</Trans>
        </styledEl.Option>
        <styledEl.OptionCustom active={isSlippageModified} warning={!!slippageError} tabIndex={-1}>
          <RowBetween>
            {showSlippageWarning && (tooLow || tooHigh) ? (
              <styledEl.SlippageEmojiContainer>
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
              </styledEl.SlippageEmojiContainer>
            ) : null}
            <styledEl.Input
              placeholder={placeholderSlippage.toFixed(2)}
              value={slippageViewValue}
              onChange={(e) => parseSlippageInput(e.target.value)}
              onBlur={onSlippageInputBlur}
            />
            %
          </RowBetween>
        </styledEl.OptionCustom>
      </RowBetween>
      { showSlippageWarning && (
        <SlippageWarningMessage error={!!slippageError}
                                theme={theme}
                                tooLow={tooLow}
                                tooHigh={tooHigh}
                                max={max}
                                min={min}/>
      )}
      {isSmartSlippageApplied && (
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
            <span>Dynamic</span>
          </styledEl.SmartSlippageInfo>
        </RowBetween>
      )}
    </>
  )
}
