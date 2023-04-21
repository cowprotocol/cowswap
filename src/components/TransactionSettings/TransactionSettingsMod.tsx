import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { L2_CHAIN_IDS } from 'constants/chains'
import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc'
// import ms from 'ms.macro'
import { darken } from 'polished'
import { useContext, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from 'theme'
import { AutoColumn } from 'components/Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'

// MOD imports
import {
  MINIMUM_ORDER_VALID_TO_TIME_SECONDS,
  MIN_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_BPS,
  DEFAULT_SLIPPAGE_BPS,
  MINIMUM_ETH_FLOW_DEADLINE_SECONDS,
  MINIMUM_ETH_FLOW_SLIPPAGE_BIPS,
  HIGH_ETH_FLOW_SLIPPAGE_BIPS,
  MINIMUM_ETH_FLOW_SLIPPAGE,
} from 'constants/index'
import { slippageToleranceAnalytics, orderExpirationTimeAnalytics } from 'components/analytics'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { getNativeSlippageTooltip, getNonNativeSlippageTooltip } from '@cow/modules/swap/pure/Row/RowSlippageContent'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'
import { getNativeOrderDeadlineTooltip, getNonNativeOrderDeadlineTooltip } from '@cow/modules/swap/pure/Row/RowDeadline'
import { useWalletInfo } from '@cow/modules/wallet'

const MAX_DEADLINE_MINUTES = 180 // 3h

enum SlippageError {
  InvalidInput = 'InvalidInput',
}

enum DeadlineError {
  InvalidInput = 'InvalidInput',
}

export const FancyButton = styled.button`
  color: ${({ theme }) => theme.text1};
  align-items: center;
  height: 2rem;
  border-radius: 36px;
  font-size: 1rem;
  width: auto;
  min-width: 3.5rem;
  /* border: 1px solid ${({ theme }) => theme.bg3}; */
  border: 0; // mod
  outline: none;
  /* background: ${({ theme }) => theme.bg1}; */
  background: ${({ theme }) => theme.bg2}; // mod
  :hover {
    /* border: 1px solid ${({ theme }) => theme.bg4}; */
  }
  :focus {
    /* border: 1px solid ${({ theme }) => theme.primary1}; */
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }

  &:disabled {
    border: none;
    pointer-events: none;
  }
  /* background-color: ${({ active, theme }) => active && theme.primary1}; */
  background-color: ${({ active, theme }) => (active ? theme.bg2 : theme.grey1)}; // MOD
  /* color: ${({ active, theme }) => (active ? theme.white : theme.text1)}; */
  color: ${({ active, theme }) => (active ? theme.white : theme.text1)}; // MOD
`

export const Input = styled.input`
  background: ${({ theme }) => theme.bg1};
  font-size: 16px;
  width: auto;
  outline: none;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  color: ${({ theme, color }) => (color === 'red' ? theme.red1 : theme.text1)};
  text-align: right;
`

export const OptionCustom = styled(FancyButton)<{ active?: boolean; warning?: boolean }>`
  height: 2rem;
  position: relative;
  padding: 0 0.75rem;
  flex: 1;
  border: ${({ theme, active, warning }) => active && `1px solid ${warning ? theme.red1 : theme.primary1}`};
  :hover {
    border: ${({ theme, active, warning }) =>
      active && `1px solid ${warning ? darken(0.1, theme.red1) : darken(0.1, theme.primary1)}`};
  }

  input {
    width: 100%;
    height: 100%;
    border: 0px;
    border-radius: 2rem;
  }
`

const SlippageEmojiContainer = styled.span`
  color: #f3841e;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `}
`

export interface TransactionSettingsProps {
  placeholderSlippage: Percent // varies according to the context in which the settings dialog is placed
}

// const THREE_DAYS_IN_SECONDS = ms`3 days` / 1000

export default function TransactionSettings({ placeholderSlippage }: TransactionSettingsProps) {
  const { chainId } = useWalletInfo()
  const theme = useContext(ThemeContext)

  const isEthFlow = useIsEthFlow()
  const { native: nativeCurrency } = useDetectNativeToken()

  const userSlippageTolerance = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  const [deadline, setDeadline] = useUserTransactionTTL()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  function parseSlippageInput(value: string) {
    // populate what the user typed and clear the error
    setSlippageInput(value)
    setSlippageError(false)

    if (value.length === 0) {
      slippageToleranceAnalytics('Default', isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BIPS : DEFAULT_SLIPPAGE_BPS)
      setUserSlippageTolerance(isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE : 'auto')
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
        parsed < (isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BIPS : MIN_SLIPPAGE_BPS) ||
        parsed > MAX_SLIPPAGE_BPS
      ) {
        slippageToleranceAnalytics('Default', isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BIPS : DEFAULT_SLIPPAGE_BPS)
        setUserSlippageTolerance('auto')
        if (v !== '.') {
          setSlippageError(SlippageError.InvalidInput)
        }
      } else {
        slippageToleranceAnalytics('Custom', parsed)
        setUserSlippageTolerance(new Percent(parsed, 10_000))
      }
    }
  }

  const tooLow =
    userSlippageTolerance !== 'auto' &&
    userSlippageTolerance.lessThan(new Percent(isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE_BIPS : LOW_SLIPPAGE_BPS, 10_000))
  const tooHigh =
    userSlippageTolerance !== 'auto' &&
    userSlippageTolerance.greaterThan(new Percent(isEthFlow ? HIGH_ETH_FLOW_SLIPPAGE_BIPS : HIGH_SLIPPAGE_BPS, 10_000))

  function parseCustomDeadline(value: string) {
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
          parsed <
            (isEthFlow
              ? // 10 minute low threshold for eth flow
                MINIMUM_ETH_FLOW_DEADLINE_SECONDS
              : MINIMUM_ORDER_VALID_TO_TIME_SECONDS) || // Check deadline is not too small
          parsed > MAX_DEADLINE_MINUTES * 60 // Check deadline is not too big
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
  }

  const showCustomDeadlineRow = Boolean(chainId && !L2_CHAIN_IDS.includes(chainId))

  return (
    <AutoColumn gap="md">
      <AutoColumn gap="sm">
        <RowFixed>
          <ThemedText.Black fontWeight={400} fontSize={14} color={theme.text2}>
            <Trans>MEV protected slippage</Trans>
          </ThemedText.Black>
          <QuestionHelper
            // bgColor={theme.bg3}
            bgColor={theme.grey1} // mod
            color={theme.text1}
            text={
              // <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
              isEthFlow
                ? getNativeSlippageTooltip([nativeCurrency.symbol, nativeCurrency.wrapped.symbol])
                : getNonNativeSlippageTooltip()
            }
          />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              parseSlippageInput('')
            }}
            active={userSlippageTolerance === 'auto'}
            disabled={isEthFlow}
          >
            <Trans>Auto</Trans>
          </Option>
          <OptionCustom active={userSlippageTolerance !== 'auto'} warning={!!slippageError} tabIndex={-1}>
            <RowBetween>
              {tooLow || tooHigh ? (
                <SlippageEmojiContainer>
                  <span role="img" aria-label="warning">
                    ⚠️
                  </span>
                </SlippageEmojiContainer>
              ) : null}
              <Input
                placeholder={placeholderSlippage.toFixed(2)}
                value={
                  slippageInput.length > 0
                    ? slippageInput
                    : userSlippageTolerance === 'auto'
                    ? ''
                    : userSlippageTolerance.toFixed(2)
                }
                onChange={(e) => parseSlippageInput(e.target.value)}
                onBlur={() => {
                  setSlippageInput('')
                  setSlippageError((curr) => {
                    // When ethFlow and there was an error
                    // Set the slippage to minimum allowed
                    // Otherwise it'll default to last value used
                    if (curr && isEthFlow) {
                      setUserSlippageTolerance(MINIMUM_ETH_FLOW_SLIPPAGE)
                    }
                    return false
                  })
                }}
                color={slippageError ? 'red' : ''}
              />
              %
            </RowBetween>
          </OptionCustom>
        </RowBetween>
        {slippageError || tooLow || tooHigh ? (
          <RowBetween
            style={{
              fontSize: '14px',
              paddingTop: '7px',
              // color: slippageError ? 'red' : '#F3841E',
              color: slippageError ? theme.danger : theme.warning, // MOD
            }}
          >
            {slippageError ? (
              <Trans>
                Enter slippage percentage between{' '}
                {isEthFlow ? MINIMUM_ETH_FLOW_SLIPPAGE.toFixed(0) : MIN_SLIPPAGE_BPS / 100}% and{' '}
                {MAX_SLIPPAGE_BPS / 100}%
              </Trans>
            ) : tooLow ? (
              <Trans>Your transaction may expire</Trans>
            ) : (
              <Trans>High slippage amount selected</Trans>
            )}
          </RowBetween>
        ) : null}
      </AutoColumn>

      {showCustomDeadlineRow && (
        <AutoColumn gap="sm">
          <RowFixed>
            <ThemedText.Black fontSize={14} fontWeight={400} color={theme.text2}>
              <Trans>Swap deadline</Trans>
            </ThemedText.Black>
            <QuestionHelper
              // bgColor={theme.bg3}
              bgColor={theme.grey1} // mod
              color={theme.text1}
              text={
                <Trans>
                  {isEthFlow
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
              />
            </OptionCustom>
            <ThemedText.Body style={{ paddingLeft: '8px' }} fontSize={14}>
              <Trans>minutes</Trans>
            </ThemedText.Body>
          </RowFixed>
        </AutoColumn>
      )}
    </AutoColumn>
  )
}
