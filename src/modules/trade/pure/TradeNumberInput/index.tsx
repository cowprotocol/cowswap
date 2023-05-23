import { TradeWidgetField, TradeWidgetFieldProps } from 'modules/trade/pure/TradeWidgetField'
import { useMemo } from 'react'
import { NumericalInput, Suffix } from './styled'
import { TradeWidgetFieldError } from 'modules/trade/pure/TradeWidgetField'

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
export { NumericalInput } from './styled'
