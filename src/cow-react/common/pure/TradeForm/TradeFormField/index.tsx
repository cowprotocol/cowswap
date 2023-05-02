import styled from 'styled-components/macro'
import { transparentize } from 'polished'

const Wrapper = styled.div`
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
  min-height: 80px;
  justify-content: space-between;
  display: flex;
  flex-flow: row wrap;
`

const Label = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
  width: 100%;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export interface TradeFormFieldProps {
  label: string
  children?: JSX.Element
}

export function TradeFormField(props: TradeFormFieldProps) {
  const { label, children } = props

  return (
    <Wrapper>
      <Label>{label}</Label>
      {children}
    </Wrapper>
  )
}
