import { useCallback, useEffect, useState } from 'react'

import carretDown from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { Command } from '@cowprotocol/types'

import BigNumberJs from 'bignumber.js'
import SVG from 'react-inlinesvg'

import { TradeWidgetField, TradeWidgetFieldProps } from 'modules/trade/pure/TradeWidgetField'

import { ArrowsWrapper, InputWrapper, NumericalInput, Suffix } from './styled'

export { NumericalInput } from './styled'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: number | null

  onUserInput(input: number | null): void

  suffix?: string
  decimalsPlaces?: number
  min?: number
  /**
   * max === undefined => use the default
   * max === null => no max
   * max === number => max value
   */
  max?: number | null
  step?: number
  placeholder?: string
  showUpDownArrows?: boolean
  upDownArrowsLeftAlign?: boolean
  prefixComponent?: React.ReactElement
}

type InputArrowsProps = {
  onClickUp: Command
  onClickDown: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function InputArrows({ onClickUp, onClickDown }: InputArrowsProps) {
  return (
    <ArrowsWrapper>
      <span role="button" aria-label="Increase Value" aria-disabled="false" onClick={onClickUp}>
        <span role="img" aria-label="up">
          <SVG src={carretDown} />
        </span>
      </span>

      <span role="button" aria-label="Decrease Value" aria-disabled="false" onClick={onClickDown}>
        <span role="img" aria-label="down">
          <SVG src={carretDown} />
        </span>
      </span>
    </ArrowsWrapper>
  )
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type, complexity
export function TradeNumberInput(props: TradeNumberInputProps) {
  const {
    value,
    suffix,
    onUserInput,
    placeholder = '0',
    decimalsPlaces = 0,
    min,
    max: inputMax,
    step = 1,
    prefixComponent,
    showUpDownArrows = false,
    upDownArrowsLeftAlign = false,
  } = props

  const max = inputMax === undefined ? 100_000 : inputMax

  const [displayedValue, setDisplayedValue] = useState(value === null ? '' : value.toString())
  const [isFocused, setIsFocused] = useState(false)

  const validateInput = useCallback(
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line complexity
    (newValue: string) => {
      const hasDot = newValue.includes('.')
      const [quotient, decimals] = (newValue || '').split('.')
      const filteredDecimals = decimalsPlaces && hasDot ? `.${decimals.slice(0, decimalsPlaces)}` : ''
      const adjustedValue = quotient + filteredDecimals
      const parsedValue = adjustedValue ? parseFloat(adjustedValue) : null

      if (parsedValue && max !== null && parsedValue > max) {
        setDisplayedValue(max.toString())
        onUserInput(max)
        return
      }

      if (min !== undefined && (!parsedValue || parsedValue < min)) {
        setDisplayedValue(min.toString())
        onUserInput(min)
        return
      }

      setDisplayedValue(adjustedValue)

      if (value !== parsedValue) {
        onUserInput(parsedValue)
      }
    },
    [onUserInput, value, min, max, decimalsPlaces]
  )

  // Initial setup of value
  useEffect(() => {
    if (isFocused) return

    validateInput(value !== null ? value.toString() : '')
  }, [value, validateInput, isFocused])

  const onClickUp = useCallback(() => {
    validateInput(increaseValue(displayedValue, step, min))
  }, [displayedValue, min, step, validateInput])

  const onClickDown = useCallback(() => {
    validateInput(decreaseValue(displayedValue, step, min))
  }, [displayedValue, min, step, validateInput])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        onClickUp()
      } else if (e.key === 'ArrowDown') {
        onClickDown()
      }
    },
    [onClickDown, onClickUp]
  )

  return (
    <TradeWidgetField {...props} hasPrefix={!!prefixComponent}>
      <>
        {prefixComponent}
        <InputWrapper showUpDownArrows={showUpDownArrows} upDownArrowsLeftAlign={upDownArrowsLeftAlign}>
          <NumericalInput
            placeholder={placeholder}
            value={displayedValue}
            onBlur={(e) => {
              validateInput(e.target.value)
              setIsFocused(false)
            }}
            onFocus={() => setIsFocused(true)}
            onUserInput={setDisplayedValue}
            onKeyDown={onKeyDown}
            min={min}
            max={max || undefined}
            step={step}
          />
          {showUpDownArrows && <InputArrows onClickUp={onClickUp} onClickDown={onClickDown} />}
          {suffix && <Suffix>{suffix}</Suffix>}
        </InputWrapper>
      </>
    </TradeWidgetField>
  )
}

/**
 * Increase `value` by `step`
 *
 * If no `value`, use `min`
 * If no `min`, use `step`
 *
 * Uses BigNumberJS for avoiding JS finicky float point math
 */
function increaseValue(value: string, step: number, min: number | undefined): string {
  const n = new BigNumberJs(value)

  if (!n.isNaN()) {
    return n.plus(step).toString()
  }

  return min?.toString() || step.toString()
}

/**
 * Decrease `value` by `step`
 *
 * If no `value`, use `min`
 * If no `min`, use `step`

 * Uses BigNumberJS for avoiding JS finicky float point math
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function decreaseValue(value: string, step: number, min: number | undefined) {
  const n = new BigNumberJs(value)

  if (!n.isNaN()) {
    return n.minus(step).toString()
  }

  return min?.toString() || step.toString()
}
