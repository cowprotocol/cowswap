import { TradeWidgetFieldBox, TradeWidgetFieldLabel, Content, ErrorText } from './styled'
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
    <TradeWidgetFieldBox>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {hint && <QuestionHelper text={hint} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
