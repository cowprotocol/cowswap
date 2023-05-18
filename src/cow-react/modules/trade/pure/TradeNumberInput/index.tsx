import { TradeWidgetField, TradeWidgetFieldProps } from '@cow/modules/trade/pure/TradeWidgetField'
import { NumericalInput } from '@cow/modules/advancedOrders/pure/NumericalInput'
import { useMemo } from 'react'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: string | number
  onUserInput(input: string): void
  suffix?: string
  error?: string | null
  warning?: string | null
}

export function TradeNumberInput(props: TradeNumberInputProps) {
  const { value, suffix, onUserInput, warning, error } = props

  const color = useMemo(() => {
    if (error) return 'red'
    else return ''
  }, [error, warning])

  return (
    <TradeWidgetField {...props}>
      <>
        <NumericalInput color={color} value={value} onUserInput={onUserInput} />
        {suffix && <span>{suffix}</span>}
      </>
    </TradeWidgetField>
  )
}
