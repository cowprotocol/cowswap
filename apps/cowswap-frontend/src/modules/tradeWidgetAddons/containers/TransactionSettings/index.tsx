import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
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
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed, UI } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'
import { TradeType } from '@cowprotocol/widget-lib'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'

import { useInjectedWidgetDeadline } from 'modules/injectedWidget'
import { useIsEoaEthFlow } from 'modules/trade'
import { useSmartSlippageFromQuote } from 'modules/tradeQuote'
import {
  useDefaultTradeSlippage,
  useIsSlippageModified,
  useIsSmartSlippageApplied,
  useSetSlippage,
  useTradeSlippage,
} from 'modules/tradeSlippage'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import {
  getNativeOrderDeadlineTooltip,
  getNativeSlippageTooltip,
  getNonNativeOrderDeadlineTooltip,
  getNonNativeSlippageTooltip,
} from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'


import * as styledEl from './styled'

const MAX_EOA_DEADLINE_MINUTES = 60 * 3 // 3h
const MAX_SC_DEADLINE_MINUTES = 60 * 12 // 12h

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

interface TransactionSettingsProps {
  deadlineState: StatefulValue<number>
}

type TxSettingAction = 'Default' | 'Custom'

interface SlippageAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Slippage Tolerance`
  value: number
}

interface DeadlineAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TRADE
  action: `${TxSettingAction} Order Expiration Time`
  value: number
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function TransactionSettings({ deadlineState }: TransactionSettingsProps) {
  const { chainId } = useWalletInfo()
  const theme = useContext(ThemeContext)
  const analytics = useCowAnalytics()

  const isSmartContractWallet = useIsSmartContractWallet()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const swapSlippage = useTradeSlippage()
  const defaultSwapSlippage = useDefaultTradeSlippage()
  const setSwapSlippage = useSetSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSlippageFromQuote()

  const chosenSlippageMatchesSmartSlippage = smartSlippage !== null && new Percent(smartSlippage, 10_000).equalTo(swapSlippage)

  const [deadline, setDeadline] = deadlineState
  const widgetDeadline = useInjectedWidgetDeadline(TradeType.SWAP)

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  const minEthFlowSlippageBps = MINIMUM_ETH_FLOW_SLIPPAGE_BPS[chainId]
  const minEthFlowSlippage = MINIMUM_ETH_FLOW_SLIPPAGE[chainId]

  const isSlippageModified = useIsSlippageModified()

  const placeholderSlippage = isSlippageModified ? defaultSwapSlippage : swapSlippage

  const sendSlippageAnalytics = useCallback(
    (action: TxSettingAction, value: string | number) => {
      const analyticsEvent: SlippageAnalyticsEvent = {
        category: CowSwapAnalyticsCategory.TRADE,
        action: `${action} Slippage Tolerance`,
        value: typeof value === 'string' ? parseFloat(value) : value,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const sendDeadlineAnalytics = useCallback(
    (action: TxSettingAction, value: number) => {
      const analyticsEvent: DeadlineAnalyticsEvent = {
        category: CowSwapAnalyticsCategory.TRADE,
        action: `${action} Order Expiration Time`,
        value,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const parseSlippageInput = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        sendSlippageAnalytics('Default', placeholderSlippage.toFixed(2))
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

        sendSlippageAnalytics('Custom', parsed)
        setSwapSlippage(percentToBps(new Percent(parsed, 10_000)))
      }
    },
    [
      placeholderSlippage,
      isEoaEthFlow,
      minEthFlowSlippage,
      minEthFlowSlippageBps,
      setSwapSlippage,
      sendSlippageAnalytics,
    ],
  )

  const tooLow = swapSlippage.lessThan(new Percent(isEoaEthFlow ? minEthFlowSlippageBps : LOW_SLIPPAGE_BPS, 10_000))
  const tooHigh = swapSlippage.greaterThan(
    new Percent(isEoaEthFlow ? HIGH_ETH_FLOW_SLIPPAGE_BPS : smartSlippage || HIGH_SLIPPAGE_BPS, 10_000),
  )

  const minDeadline = isEoaEthFlow
    ? // 10 minute low threshold for eth flow
      MINIMUM_ETH_FLOW_DEADLINE_SECONDS
    : MINIMUM_ORDER_VALID_TO_TIME_SECONDS
  const maxDeadline = (isSmartContractWallet ? MAX_SC_DEADLINE_MINUTES : MAX_EOA_DEADLINE_MINUTES) * 60

  const parseCustomDeadline = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setDeadlineInput(value)
      setDeadlineError(false)

      if (value.length === 0) {
        sendDeadlineAnalytics('Default', DEFAULT_DEADLINE_FROM_NOW)
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
            sendDeadlineAnalytics('Custom', parsed)
            setDeadline(parsed)
          }
        // TODO: Replace any with proper type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          console.error(error)
          setDeadlineError(DeadlineError.InvalidInput)
        }
      }
    },
    [minDeadline, maxDeadline, setDeadline, sendDeadlineAnalytics],
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
  }, [widgetDeadline, minDeadline, maxDeadline, setDeadline])

  const isDeadlineDisabled = !!widgetDeadline

  const showCustomDeadlineRow = Boolean(chainId)

  const onSlippageInputBlur = useCallback(() => {
    if (slippageError) {
      sendSlippageAnalytics('Default', placeholderSlippage.toFixed(2))
      setSwapSlippage(null)
      setSlippageError(false)
    }

    setSlippageInput('')
  }, [slippageError, placeholderSlippage, setSwapSlippage, sendSlippageAnalytics])

  const wrapperRef = useRef(null)

  useOnClickOutside([wrapperRef], onSlippageInputBlur)

  return (
    <styledEl.Wrapper>
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
            <styledEl.Option
              onClick={() => {
                setSwapSlippage(null)
              }}
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
                  value={slippageInput.length > 0 ? slippageInput : (!isSlippageModified ? '' : swapSlippage.toFixed(2))}
                  onChange={(e) => parseSlippageInput(e.target.value)}
                  onBlur={onSlippageInputBlur}
                  color={slippageError ? 'red' : ''}
                />
                %
              </RowBetween>
            </styledEl.OptionCustom>
          </RowBetween>
          {!isSmartSlippageApplied && !chosenSlippageMatchesSmartSlippage && (slippageError || tooLow || tooHigh) ? (
            <RowBetween
              style={{
                fontSize: '14px',
                paddingTop: '7px',
                color: slippageError ? `var(${UI.COLOR_DANGER})` : theme.warning,
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
              <styledEl.OptionCustom style={{ width: '80px' }} warning={!!deadlineError} tabIndex={-1}>
                <styledEl.Input
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
              </styledEl.OptionCustom>
              <ThemedText.Body style={{ paddingLeft: '8px' }} fontSize={14}>
                <Trans>minutes</Trans>
              </ThemedText.Body>
            </RowFixed>
          </AutoColumn>
        )}
      </AutoColumn>
    </styledEl.Wrapper>
  )
}
