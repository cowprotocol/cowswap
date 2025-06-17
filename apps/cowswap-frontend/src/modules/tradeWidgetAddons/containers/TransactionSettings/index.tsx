import { JSX, useCallback, useContext, useRef, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import {
  HIGH_ETH_FLOW_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  MIN_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
  MINIMUM_ETH_FLOW_SLIPPAGE_BPS,
} from '@cowprotocol/common-const'
import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { getWrappedToken, isValidInteger, percentToBps } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Percent } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'

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
  getNativeSlippageTooltip,
  getNonNativeSlippageTooltip,
} from 'common/utils/tradeSettingsTooltips'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'


import * as styledEl from './styled'
import { DeadlineTransactionSettings } from '../DeadlineTransactionSettings'
import { SlippageWarningMessage } from '../SlippageWarning'

enum SlippageError {
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

export function TransactionSettings({ deadlineState }: TransactionSettingsProps): JSX.Element {
  const { chainId } = useWalletInfo()
  const theme = useContext(ThemeContext)
  const analytics = useCowAnalytics()

  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()

  const swapSlippage = useTradeSlippage()
  const defaultSwapSlippage = useDefaultTradeSlippage()
  const setSwapSlippage = useSetSlippage()
  const isSmartSlippageApplied = useIsSmartSlippageApplied()
  const smartSlippage = useSmartSlippageFromQuote()

  const chosenSlippageMatchesSmartSlippage = smartSlippage !== null && new Percent(smartSlippage, 10_000).equalTo(swapSlippage)

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

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

  const parseSlippageInput = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        sendSlippageAnalytics('Default', placeholderSlippage.toFixed(2))
        setSwapSlippage(null)
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
        const isValidInput = isValidInteger(
          isEoaEthFlow ? minEthFlowSlippageBps : MIN_SLIPPAGE_BPS,
          MAX_SLIPPAGE_BPS,
        )

        if (!isValidInput(parsed)) {
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
      minEthFlowSlippageBps,
      setSwapSlippage,
      sendSlippageAnalytics,
    ],
  )

  const tooLow = swapSlippage.lessThan(new Percent(isEoaEthFlow ? minEthFlowSlippageBps : LOW_SLIPPAGE_BPS, 10_000))

  const tooHigh = swapSlippage.greaterThan(
    new Percent(isEoaEthFlow ? smartSlippage || HIGH_ETH_FLOW_SLIPPAGE_BPS : smartSlippage || HIGH_SLIPPAGE_BPS, 10_000),
  )

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
        </AutoColumn>
        {showCustomDeadlineRow && (
          <AutoColumn gap="sm">
            <DeadlineTransactionSettings deadlineState={deadlineState}/>
          </AutoColumn>
        )}
      </AutoColumn>
    </styledEl.Wrapper>
  )
}
