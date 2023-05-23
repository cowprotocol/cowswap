import { TradeWidgetFieldBox, TradeWidgetFieldLabel, Content, ErrorText } from './styled'
import { Trans } from '@lingui/macro'
import QuestionHelper from 'legacy/components/QuestionHelper'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: string
  children?: JSX.Element
  hint?: JSX.Element | string
  error?: TradeWidgetFieldError
  className?: string
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { className, children, label, hint, error } = props
  return (
    <TradeWidgetFieldBox className={className}>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {hint && <QuestionHelper text={hint} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
