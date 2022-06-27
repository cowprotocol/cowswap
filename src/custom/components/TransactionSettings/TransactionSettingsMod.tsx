import { Trans } from '@lingui/macro'
import { Percent } from '@uniswap/sdk-core'
import { L2_CHAIN_IDS } from '@src/constants/chains'
import { DEFAULT_DEADLINE_FROM_NOW } from 'constants/misc'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import ms from 'ms.macro'
import { darken } from 'polished'
import { useCallback, useContext, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance, useUserTransactionTTL } from 'state/user/hooks'
import styled, { ThemeContext } from 'styled-components/macro'

import { ThemedText } from 'theme'
import { AutoColumn } from 'components/Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from 'components/Row'
// import ReactGA from 'react-ga4'

// MOD imports
import {
  INPUT_OUTPUT_EXPLANATION,
  MINIMUM_ORDER_VALID_TO_TIME_SECONDS,
  MIN_SLIPPAGE_BPS,
  MAX_SLIPPAGE_BPS,
  LOW_SLIPPAGE_BPS,
  HIGH_SLIPPAGE_BPS,
  DEFAULT_SLIPPAGE_BPS,
} from 'constants/index'
import { slippageToleranceAnalytics, orderExpirationTimeAnalytics } from 'utils/analytics'

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
  border: 1px solid ${({ theme }) => theme.bg3};
  outline: none;
  background: ${({ theme }) => theme.bg1};
  :hover {
    border: 1px solid ${({ theme }) => theme.bg4};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.primary1};
  }
`

const Option = styled(FancyButton)<{ active: boolean }>`
  margin-right: 8px;
  :hover {
    cursor: pointer;
  }
  background-color: ${({ active, theme }) => active && theme.primary1};
  color: ${({ active, theme }) => (active ? theme.white : theme.text1)};
`

const Input = styled.input`
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
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  const userSlippageTolerance = useUserSlippageTolerance()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  const [deadline, setDeadline] = useUserTransactionTTL()

  const [slippageInput, setSlippageInput] = useState('')
  const [slippageError, setSlippageError] = useState<SlippageError | false>(false)

  const [deadlineInput, setDeadlineInput] = useState('')
  const [deadlineError, setDeadlineError] = useState<DeadlineError | false>(false)

  const parseSlippageInput = useCallback(
    (value: string) => {
      // populate what the user typed and clear the error
      setSlippageInput(value)
      setSlippageError(false)

      if (value.length === 0) {
        slippageToleranceAnalytics('Default', DEFAULT_SLIPPAGE_BPS)
        setUserSlippageTolerance('auto')
      } else {
        const parsed = Math.floor(Number.parseFloat(value) * 100)

        if (!Number.isInteger(parsed) || parsed < MIN_SLIPPAGE_BPS || parsed > MAX_SLIPPAGE_BPS) {
          slippageToleranceAnalytics('Default', DEFAULT_SLIPPAGE_BPS)
          setUserSlippageTolerance('auto')
          if (value !== '.') {
            setSlippageError(SlippageError.InvalidInput)
          }
        } else {
          slippageToleranceAnalytics('Custom', parsed)
          setUserSlippageTolerance(new Percent(parsed, 10_000))
        }
      }
    },
    [setUserSlippageTolerance]
  )

  const tooLow =
    userSlippageTolerance !== 'auto' && userSlippageTolerance.lessThan(new Percent(LOW_SLIPPAGE_BPS, 10_000))
  const tooHigh =
    userSlippageTolerance !== 'auto' && userSlippageTolerance.greaterThan(new Percent(HIGH_SLIPPAGE_BPS, 10_000))

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
          parsed < MINIMUM_ORDER_VALID_TO_TIME_SECONDS || // Check deadline is not too small
          parsed > MAX_DEADLINE_MINUTES * 60 // Check deadline is not too big
        ) {
          setDeadlineError(DeadlineError.InvalidInput)
        } else {
          orderExpirationTimeAnalytics('Custom', parsed)
          setDeadline(parsed)
        }
      } catch (error) {
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
            bgColor={theme.bg3}
            color={theme.text1}
            text={
              // <Trans>Your transaction will revert if the price changes unfavorably by more than this percentage.</Trans>
              <Trans>
                <p>Your slippage is MEV protected: all orders are submitted with tight spread (0.1%) on-chain.</p>
                <p>
                  The slippage you pick here enables a resubmission of your order in case of unfavourable price
                  movements.
                </p>
                <p>{INPUT_OUTPUT_EXPLANATION}</p>
              </Trans>
            }
          />
        </RowFixed>
        <RowBetween>
          <Option
            onClick={() => {
              parseSlippageInput('')
            }}
            active={userSlippageTolerance === 'auto'}
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
                  setSlippageError(false)
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
              color: slippageError ? 'red' : '#F3841E',
            }}
          >
            {slippageError ? (
              <Trans>Enter a valid slippage percentage</Trans>
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
              <Trans>Transaction deadline</Trans>
            </ThemedText.Black>
            <QuestionHelper
              bgColor={theme.bg3}
              color={theme.text1}
              text={
                <Trans>
                  Your swap expires and will not execute if it is pending for longer than the selected duration.
                  {INPUT_OUTPUT_EXPLANATION}
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
