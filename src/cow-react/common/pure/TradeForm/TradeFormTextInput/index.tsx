import { TradeFormField } from '@cow/common/pure/TradeForm/TradeFormField'
import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { TradeFormInputProps } from '@cow/common/pure/TradeForm/types'

const Input = styled.input<{ size$: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  font-size: ${({ size$ }) => (size$ === 'big' ? '28px' : '21px')};
  font-weight: 500;
  color: ${({ theme }) => theme.text1};
  outline: none;
  border: none;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 26px;
  `}

  &::placeholder {
    color: ${({ theme }) => transparentize(0.3, theme.text1)};
  }
`

export interface TradeFormTextInputProps extends TradeFormInputProps {}

export function TradeFormTextInput(props: TradeFormTextInputProps) {
  const { placeholder, value, onChange, ...rest } = props
  const fontSize = props.fontSize || 'big'

  return (
    <TradeFormField {...props}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size$={fontSize}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        {...rest}
      />
    </TradeFormField>
  )
}
