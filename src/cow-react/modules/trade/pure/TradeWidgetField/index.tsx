import QuestionHelper from 'components/QuestionHelper'
import styled from 'styled-components/macro'
import { TradeWidgetFieldWrapper, TradeWidgetFieldLabel, TradeWidgetFieldGrid } from './styled'
import { Nullish } from '@cow/types'

export interface TradeWidgetFieldProps {
  label: string
  hint?: JSX.Element | string
  validationError?: Nullish<string>
}

const Control = styled.div`
  max-width: 42%;
  white-space: nowrap;
`

const ValidationError = styled.div`
  color: ${({ theme }) => theme.red1};
  font-size: 12px;
`

export function TradeWidgetField(props: TradeWidgetFieldProps & { children: JSX.Element }) {
  const { label, hint, children, validationError } = props

  return (
    <TradeWidgetFieldWrapper>
      <TradeWidgetFieldGrid>
        <TradeWidgetFieldLabel>
          <span>{label}</span> {hint && <QuestionHelper text={hint} />}
        </TradeWidgetFieldLabel>
        <Control>{children}</Control>
      </TradeWidgetFieldGrid>

      {validationError && <ValidationError>{validationError}</ValidationError>}
    </TradeWidgetFieldWrapper>
  )
}
