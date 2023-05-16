import { TradeWidgetField, TradeWidgetFieldProps } from '@cow/modules/trade/pure/TradeWidgetField'
import styled from 'styled-components/macro'
import { ChangeEvent, useCallback } from 'react'

export interface TradeNumberInputProps extends TradeWidgetFieldProps {
  value: string | number
  onChange(input: number): void
  suffix?: string
}

const StyledInput = styled.input`
  width: 100%;
  background: none;
  outline: none;
  border: 0;
  text-align: right;
  font-size: 18px;
  color: ${({ theme }) => theme.text1};

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    opacity: 1;
  }
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
`

export function TradeNumberInput(props: TradeNumberInputProps) {
  const { value, onChange, suffix } = props

  const onChangeCallback = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value

    onChange(val ? parseFloat(val) : 0)
  }, [])

  // TODO: allow dot entering and ban comma
  return (
    <TradeWidgetField {...props}>
      <>
        <InputWrapper>
          <StyledInput type="number" value={value} onChange={onChangeCallback} />
          {suffix && <span>{suffix}</span>}
        </InputWrapper>
      </>
    </TradeWidgetField>
  )
}
