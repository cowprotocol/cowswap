import { TradeWidgetField, TradeWidgetFieldProps } from 'modules/trade/pure/TradeWidgetField'
import { useCallback, useEffect, useState } from 'react'
import { NumericalInput, Suffix } from './styled'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: number | null
  onUserInput(input: number | null): void
  suffix?: string
  decimalsPlaces?: number
  min?: number
  max?: number
  placeholder?: string
}

export function TradeNumberInput(props: TradeNumberInputProps) {
  const { value, suffix, onUserInput, placeholder, decimalsPlaces = 0, min, max = 0 } = props

  const [displayedValue, setDisplayedValue] = useState(value === null ? '' : value.toString())

  const onChange = useCallback(
    (newValue: string) => {
      const hasDot = newValue.includes('.')
      const [quotient, decimals] = (newValue || '').split('.')
      const filteredDecimals = decimalsPlaces && hasDot ? `.${decimals.slice(0, decimalsPlaces)}` : ''
      const adjustedValue = quotient + filteredDecimals
      const parsedValue = adjustedValue ? parseFloat(adjustedValue) : null

      if (parsedValue && parsedValue > max) {
        setDisplayedValue(max.toString())
        onUserInput(max)
        return
      }

      if (parsedValue && min && parsedValue < min) {
        setDisplayedValue(min?.toString() || '')
        onUserInput(min || null)
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
    onChange(value ? value.toString() : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <TradeWidgetField {...props}>
      <>
        <NumericalInput placeholder={placeholder} value={displayedValue} onUserInput={onChange} />
        {suffix && <Suffix>{suffix}</Suffix>}
      </>
    </TradeWidgetField>
  )
}
export { NumericalInput } from './styled'
