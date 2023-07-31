import { useCallback, useEffect, useState } from 'react'

import SVG from 'react-inlinesvg'

import carretDown from 'legacy/assets/cow-swap/carret-down.svg'

import { TradeWidgetField, TradeWidgetFieldProps } from 'modules/trade/pure/TradeWidgetField'

import { NumericalInput, Suffix, ArrowsWrapper, InputWrapper } from './styled'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: number | null
  onUserInput(input: number | null): void
  suffix?: string
  decimalsPlaces?: number
  min?: number
  max?: number
  step?: number
  placeholder?: string
  showUpDownArrows?: boolean
  upDownArrowsLeftAlign?: boolean
  prefixComponent?: React.ReactElement
}

export function InputArrows() {
  return (
    <ArrowsWrapper>
      <span role="button" aria-label="Increase Value" aria-disabled="false">
        <span role="img" aria-label="up">
          <SVG src={carretDown} />
        </span>
      </span>
      
      <span role="button" aria-label="Decrease Value" aria-disabled="false">
        <span role="img" aria-label="down">
          <SVG src={carretDown} />
        </span>
      </span>
    </ArrowsWrapper>
  )
}

export function TradeNumberInput(props: TradeNumberInputProps) {
  const {
    value,
    suffix,
    onUserInput,
    placeholder = '0',
    decimalsPlaces = 0,
    min,
    max = 100_000,
    step = 1,
    prefixComponent,
    showUpDownArrows = false,
    upDownArrowsLeftAlign = false,
  } = props

  const [displayedValue, setDisplayedValue] = useState(value === null ? '' : value.toString())

  const validateInput = useCallback(
    (newValue: string) => {
      const hasDot = newValue.includes('.')
      const [quotient, decimals] = (newValue || '').split('.')
      const filteredDecimals = decimalsPlaces && hasDot ? `.${decimals.slice(0, decimalsPlaces)}` : ''
      const adjustedValue = quotient + filteredDecimals
      const parsedValue = adjustedValue ? parseFloat(adjustedValue) : null

      if (parsedValue && max !== 0 && parsedValue > max) {
        setDisplayedValue(max.toString())
        onUserInput(max)
        return
      }

      if (min && (!parsedValue || parsedValue < min)) {
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
    validateInput(value ? value.toString() : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TradeWidgetField {...props} hasPrefix={!!prefixComponent}>
      <>
        {prefixComponent}
        <InputWrapper showUpDownArrows={showUpDownArrows} upDownArrowsLeftAlign={upDownArrowsLeftAlign}>
          <NumericalInput
            placeholder={placeholder}
            value={displayedValue}
            onBlur={(e) => validateInput(e.target.value)}
            onUserInput={(value) => setDisplayedValue(value)}
            min={min}
            max={max}
            step={step}
          />
          {showUpDownArrows && <InputArrows />}
          {suffix && <Suffix>{suffix}</Suffix>}
        </InputWrapper>
      </>
    </TradeWidgetField>
  )
}
export { NumericalInput } from './styled'
