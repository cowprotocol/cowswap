import { TradeWidgetField, TradeWidgetFieldProps } from '@cow/modules/trade/pure/TradeWidgetField'
import { NumericalInput } from '@cow/modules/advancedOrders/pure/NumericalInput'
import { useMemo } from 'react'
import { Suffix } from './styled'
import { TradeWidgetFieldError } from '@cow/modules/trade/pure/TradeWidgetField'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: string | number
  onUserInput(input: string): void
  suffix?: string
  error?: TradeWidgetFieldError
}

export function TradeNumberInput(props: TradeNumberInputProps) {
  const { value, suffix, onUserInput, error } = props

  const color = useMemo(() => {
    if (error?.type === 'error') return 'red'
    else if (error?.type === 'warning') return 'yellow'
    else return ''
  }, [error])

  return (
    <TradeWidgetField {...props}>
      <>
        <NumericalInput color={color} value={value} onUserInput={onUserInput} />
        {suffix && <Suffix>{suffix}</Suffix>}
      </>
    </TradeWidgetField>
  )
}
