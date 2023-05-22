import { Wrapper, Label, Content, ErrorText } from './styled'
import { Trans } from '@lingui/macro'
import QuestionHelper from 'legacy/components/QuestionHelper'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: string
  children?: JSX.Element
  hint?: JSX.Element | string
  error?: TradeWidgetFieldError
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { children, label, hint, error } = props
  return (
    <Wrapper>
      <Label>
        <Trans>{label}</Trans>
        {hint && <QuestionHelper text={hint} />}
      </Label>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </Wrapper>
  )
}
