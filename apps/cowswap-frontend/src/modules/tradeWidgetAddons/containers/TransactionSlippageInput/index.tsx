import { JSX, useContext } from 'react'

import {
  HIGH_ETH_FLOW_SLIPPAGE_BPS, HIGH_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS
} from '@cowprotocol/common-const'
import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'

import { useIsEoaEthFlow } from 'modules/trade'
import { useSmartSlippageFromQuote } from 'modules/tradeQuote'
import {
  useIsSlippageModified,
  useIsSmartSlippageApplied,
  useTradeSlippage,
} from 'modules/tradeSlippage'
import { SlippageWarningMessage } from 'modules/tradeWidgetAddons/pure/SlippageWarning'

import { useMinEthFlowSlippage } from './hooks/useMinEthFlowSlippage'
import { useSlippageInput } from './hooks/useSlippageInput'
import * as styledEl from './styled'

import { SlippageTooltip } from '../SlippageTooltip'

export function TransactionSlippageInput(): JSX.Element {
  const theme = useContext(ThemeContext)

  const isEoaEthFlow = useIsEoaEthFlow()

  const swapSlippage = useTradeSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSlippageFromQuote()

  const chosenSlippageMatchesSmartSlippage = smartSlippage !== null && new Percent(smartSlippage, 10_000).equalTo(swapSlippage)

  const { minEthFlowSlippageBps, minEthFlowSlippage } = useMinEthFlowSlippage()

  const isSlippageModified = useIsSlippageModified()

  const tooLow = swapSlippage.lessThan(new Percent(isEoaEthFlow ? minEthFlowSlippageBps : LOW_SLIPPAGE_BPS, 10_000))

  const tooHigh = swapSlippage.greaterThan(
    new Percent(isEoaEthFlow ? smartSlippage || HIGH_ETH_FLOW_SLIPPAGE_BPS : smartSlippage || HIGH_SLIPPAGE_BPS, 10_000),
  )

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
            {!isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage && (tooLow || tooHigh) ? (
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
      { !isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage && (
        <SlippageWarningMessage error={!!slippageError}
                                theme={theme}
                                tooLow={tooLow}
                                tooHigh={tooHigh}
                                max={MAX_SLIPPAGE_BPS / 100}
                                min={isEoaEthFlow ? +minEthFlowSlippage.toFixed(1) : MIN_SLIPPAGE_BPS / 100}/>
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
