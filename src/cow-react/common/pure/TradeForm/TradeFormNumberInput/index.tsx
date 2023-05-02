import { TradeFormField } from '@cow/common/pure/TradeForm/TradeFormField'
import { Input } from '@src/components/NumericalInput'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { TradeFormInputProps } from '@cow/common/pure/TradeForm/types'

export interface TradeFormNumberInputProps extends TradeFormInputProps {}

const StyledInput = styled(Input)`
  display: block;
  width: 100%;
  background: transparent;
  text-align: left;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 26px;
  `}

  &::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`

export function TradeFormNumberInput(props: TradeFormNumberInputProps) {
  const { placeholder, value, onChange, fontSize, ...rest } = props

  return (
    <TradeFormField {...props}>
      <StyledInput
        value={value}
        onUserInput={onChange}
        placeholder={placeholder}
        fontSize={fontSize === 'medium' ? '21px' : '28px'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        {...rest}
      />
    </TradeFormField>
  )
}
