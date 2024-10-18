import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import {
  DEFAULT_DEADLINE_FROM_NOW,
  HIGH_ETH_FLOW_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS,
  MINIMUM_ORDER_VALID_TO_TIME_SECONDS,
} from '@cowprotocol/common-const'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { getWrappedToken, percentToBps } from '@cowprotocol/common-utils'
import { FancyButton, HelpTooltip, Media, RowBetween, RowFixed, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { darken } from 'color2k'
import styled, { ThemeContext } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { orderExpirationTimeAnalytics, slippageToleranceAnalytics } from 'modules/analytics'
import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { useIsSlippageModified } from 'modules/swap/hooks/useIsSlippageModified'
import { useIsSmartSlippageApplied } from 'modules/swap/hooks/useIsSmartSlippageApplied'
import { useSetSlippage } from 'modules/swap/hooks/useSetSlippage'
import { useDefaultSwapSlippage, useSmartSwapSlippage, useSwapSlippage } from 'modules/swap/hooks/useSwapSlippage'
import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from 'modules/swap/pure/Row/RowDeadline'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from 'modules/swap/pure/Row/RowSlippageContent'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

const MAX_DEADLINE_MINUTES = 180 // 3h

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;

  :hover {
    cursor: pointer;
  }

  &:disabled {
    border: none;
    pointer-events: none;
  }
`

export const Input = styled.input`
  background: var(${UI.COLOR_PAPER});
  font-size: 16px;
  width: auto;
  outline: none;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  color: ${({ theme, color }) => (color === 'red' ? theme.error : `var(${UI.COLOR_TEXT})`)};
  text-align: right;
`

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.error : theme.bg2}`};

  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(theme.error, 0.1) : darken(theme.bg2, 0.1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 2rem;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;

  ${Media.upToSmall()} {
    display: none;
  }
`

const SmartSlippageInfo = styled.div`
  color: var(${UI.COLOR_GREEN});
  font-size: 13px;
  text-align: right;
  width: 100%;
  padding-right: 0.2rem;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 0.35rem;

  > span {
    margin-left: 4px;
  }
`

const Wrapper = styled.div`
  ${RowBetween} > button, ${OptionCustom} {
    &:disabled {
      color: var(${UI.COLOR_TEXT_OPACITY_50});
      background-color: var(${UI.COLOR_PAPER});
      border: none;
      pointer-events: none;
    }
  }

  ${OptionCustom} {
    background-color: var(${UI.COLOR_PAPER_DARKER});
    border: 0;
    color: inherit;

    > div > input {
      background: transparent;
      color: inherit;

      &:disabled {
        color: inherit;
        background-color: inherit;
      }
    }

    > div > input::placeholder {
      opacity: 0.5;
      color: inherit;
    }
  }

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }

    > button {
      background-color: var(${UI.COLOR_PAPER_DARKER});
      border: 0;
    }

    > button > input {
      background: transparent;
      color: inherit;
    }

    > button > input::placeholder {
      background: transparent;
      opacity: 0.5;
      color: inherit;
    }
  }
`

export function TransactionSettings() {
  const { chainId } = useWalletInfo()
  const theme = useContext(ThemeContext)

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const swapSlippage = useSwapSlippage()
  const defaultSwapSlippage = useDefaultSwapSlippage()
  const setSwapSlippage = useSetSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSwapSlippage()

  const chosenSlippageMatchesSmartSlippage = smartSlippage && new Percent(smartSlippage, 10_000).equalTo(swapSlippage)

  const [deadline, setDeadline] = useUserTransactionTTL()
  const widgetDeadline = useInjectedWidgetDeadline(TradeType.SWAP)

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  const minEthFlowSlippageBps = MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId]
  const minEthFlowSlippage = MINIMUM_ETH_FLOW_SLIPPAGE[chainId]

  const isSlippageModified = useIsSlippageModified()

  const placeholderSlippage = isSlippageModified ? defaultSwapSlippage : swapSlippage

  const parseSlippageInput = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        slippageToleranceAnalytics('Default', placeholderSlippage.toFixed(2))
        setSwapSlippage(isEoaEthFlow ? percentToBps(minEthFlowSlippage) : null)
      } else {
        let v = value

        // Prevent inserting more than 2 decimal precision
        if (value.split('.')[1]?.length > 2) {
          // indexOf + 3 because we are cutting it off at `.XX`
          v = value.slice(0, value.indexOf('.') + 3)
          // Update the input to remove the extra numbers from UI input
          setSlippageInput(v)
        }

        const parsed = Math.round(Number.parseFloat(v) * 100)

        if (
          !Number.isInteger(parsed) ||
          parsed < (isEoaEthFlow ? minEthFlowSlippageBps : MIN_SLIPPAGE_BPS) ||
          parsed > MAX_SLIPPAGE_BPS
        ) {
          if (v !== '.') {
            setSlippageError(SlippageError.InvalidInput)
          }
        }

        slippageToleranceAnalytics('Custom', parsed)
        setSwapSlippage(percentToBps(new Percent(parsed, 10_000)))
      }
    },
    [placeholderSlippage, isEoaEthFlow, minEthFlowSlippage],
  )

  const tooLow = swapSlippage.lessThan(new Percent(isEoaEthFlow ? minEthFlowSlippageBps : LOW_SLIPPAGE_BPS, 10_000))
  const tooHigh = swapSlippage.greaterThan(
    new Percent(isEoaEthFlow ? HIGH_ETH_FLOW_SLIPPAGE_BPS : smartSlippage || HIGH_SLIPPAGE_BPS, 10_000),
  )

  const minDeadline = isEoaEthFlow
    ? // 10 minute low threshold for eth flow
      MINIMUM_ETH_FLOW_DEADLINE_SECONDS
    : MINIMUM_ORDER_VALID_TO_TIME_SECONDS
  const maxDeadline = MAX_DEADLINE_MINUTES * 60

  const parseCustomDeadline = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setDeadlineInput(value)
      setDeadlineError(false)

      if (value.length === 0) {
        orderExpirationTimeAnalytics('Default', DEFAULT_DEADLINE_FROM_NOW)
        setDeadline(DEFAULT_DEADLINE_FROM_NOW)
      } else {
        try {
          const parsed: number = Math.floor(Number.parseFloat(value) * 60)
          if (
            !Number.isInteger(parsed) || // Check deadline is a number
            parsed < minDeadline || // Check deadline is not too small
            parsed > maxDeadline // Check deadline is not too big
          ) {
            setDeadlineError(DeadlineError.InvalidInput)
          } else {
            orderExpirationTimeAnalytics('Custom', parsed)
            setDeadline(parsed)
          }
        } catch (error: any) {
          console.error(error)
          setDeadlineError(DeadlineError.InvalidInput)
        }
      }
    },
    [minDeadline, maxDeadline],
  )

  useEffect(() => {
    if (widgetDeadline) {
      // Deadline is stored in seconds
      const value = Math.floor(widgetDeadline) * 60

      if (value < minDeadline) {
        setDeadline(minDeadline)
      } else if (value > maxDeadline) {
        setDeadline(maxDeadline)
      } else {
        setDeadline(value)
      }
    }
  }, [widgetDeadline, minDeadline, maxDeadline])

  const isDeadlineDisabled = !!widgetDeadline

  const showCustomDeadlineRow = Boolean(chainId)

  const onSlippageInputBlur = useCallback(() => {
    if (slippageError) {
      slippageToleranceAnalytics('Default', placeholderSlippage.toFixed(2))
      setSwapSlippage(null)
      setSlippageError(false)
    }

    setSlippageInput('')
  }, [slippageError, placeholderSlippage, setSwapSlippage])

  const wrapperRef = useRef(null)

  useOnClickOutside([wrapperRef], onSlippageInputBlur)

  return (
    <Wrapper>
      <AutoColumn gap="md">
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.Black fontWeight={400} fontSize={14}>
              <Trans>MEV-protected slippage</Trans>
            </ThemedText.Black>
            <HelpTooltip
              text={
                // <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
                isEoaEthFlow
                  ? getNativeSlippageTooltip(chainId, [nativeCurrency.symbol, getWrappedToken(nativeCurrency).symbol])
                  : getNonNativeSlippageTooltip({ isDynamic: !!smartSlippage, isSettingsModal: true })
              }
            />
          </RowFixed>
          <RowBetween>
            <Option
              onClick={() => {
                setSwapSlippage(null)
              }}
              active={!isSlippageModified}
            >
              <Trans>Auto</Trans>
            </Option>
            <OptionCustom active={isSlippageModified} warning={!!slippageError} tabIndex={-1}>
              <RowBetween>
                {!isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage && (tooLow || tooHigh) ? (
                  <SlippageEmojiContainer>
                    <span role="img" aria-label="warning">
                      ⚠️
                    </span>
                  </SlippageEmojiContainer>
                ) : null}
                <Input
                  placeholder={placeholderSlippage.toFixed(2)}
                  value={slippageInput.length > 0 ? slippageInput : !isSlippageModified ? '' : swapSlippage.toFixed(2)}
                  onChange={(e) => parseSlippageInput(e.target.value)}
                  onBlur={onSlippageInputBlur}
                  color={slippageError ? 'red' : ''}
                />
                %
              </RowBetween>
            </OptionCustom>
          </RowBetween>
          {!isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage && (slippageError || tooLow || tooHigh) ? (
            <RowBetween
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                // color: slippageError ? 'red' : '#F3841E',
                color: slippageError ? `var(${UI.COLOR_DANGER})` : theme.warning, // MOD
              }}
            >
              {slippageError ? (
                <Trans>
                  Enter slippage percentage between{' '}
                  {isEoaEthFlow ? minEthFlowSlippage.toFixed(1) : MIN_SLIPPAGE_BPS / 100}% and {MAX_SLIPPAGE_BPS / 100}%
                </Trans>
              ) : tooLow ? (
                <Trans>Your transaction may expire</Trans>
              ) : (
                <Trans>High slippage amount selected</Trans>
              )}
            </RowBetween>
          ) : null}
          {isSmartSlippageApplied && (
            <RowBetween>
              <SmartSlippageInfo>
                <HelpTooltip
                  text={
                    <Trans>
                      CoW Swap has dynamically selected this slippage amount to account for current gas prices and
                      volatility. Changes may result in slower execution.
                    </Trans>
                  }
                />
                <span>Dynamic</span>
              </SmartSlippageInfo>
            </RowBetween>
          )}
        </AutoColumn>

        {showCustomDeadlineRow && (
          <AutoColumn gap="sm">
            <RowFixed>
              <ThemedText.Black fontSize={14} fontWeight={400}>
                <Trans>Swap deadline</Trans>
              </ThemedText.Black>
              <HelpTooltip
                text={
                  <Trans>
                    {isEoaEthFlow
                      ? getNativeOrderDeadlineTooltip([nativeCurrency.symbol])
                      : getNonNativeOrderDeadlineTooltip()}
                  </Trans>
                }
              />
            </RowFixed>
            <RowFixed>
              <OptionCustom style={{ width: '80px' }} warning={!!deadlineError} tabIndex={-1}>
                <Input
                  placeholder={(DEFAULT_DEADLINE_FROM_NOW / 60).toString()}
                  value={
                    deadlineInput.length > 0
                      ? deadlineInput
                      : deadline === DEFAULT_DEADLINE_FROM_NOW
                        ? ''
                        : (deadline / 60).toString()
                  }
                  onChange={(e) => parseCustomDeadline(e.target.value)}
                  onBlur={() => {
                    setDeadlineInput('')
                    setDeadlineError(false)
                  }}
                  color={deadlineError ? 'red' : ''}
                  disabled={isDeadlineDisabled}
                />
              </OptionCustom>
              <ThemedText.Body style={{ paddingLeft: '8px' }} fontSize={14}>
                <Trans>minutes</Trans>
              </ThemedText.Body>
            </RowFixed>
          </AutoColumn>
        )}
      </AutoColumn>
    </Wrapper>
  )
}
